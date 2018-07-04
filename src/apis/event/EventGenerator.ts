import { EventSchema } from '../../schemas/Event'
import { isRecurrent } from './utils'
import { clone } from '../../utils'
import { EventId } from 'teambition-types'

const { rrulestr } = require('rrule')

export type Timeframe = { startDate: Date, endDate: Date }

export interface DateInfo {
  startDate: string,
  endDate: string,
  recurrence?: string[]
}

export type InstanceCreator<T> = (source: T, timeframe?: Timeframe) => T

type CmpOption = 'byStartDate' | 'byEndDate'

type TimeframeFrom = {
  startDateFrom: Date
  include: boolean
}

export class RecurrenceFactory<T extends DateInfo> implements IterableIterator<T | undefined> {
  readonly type: string

  protected readonly source: T

  private startDateCursor: Date | undefined
  private done: boolean
  private readonly makeInst: InstanceCreator<T>

  private duration: number
  private isRecurrence: boolean
  private rruleSet: any

  [Symbol.iterator] = () => this

  protected constructor(source: T, type: string, makeInst: InstanceCreator<T>) {
    this.source = source
    this.type = type

    this.done = false

    this.duration = new Date(this.source.endDate).valueOf()
      - new Date(this.source.startDate).valueOf()

    this.isRecurrence = isRecurrent(this.source)
    if (this.isRecurrence) {
      this.rruleSet = rrulestr(this.source.recurrence!.join('\n'), { forceset: true })
      this.startDateCursor = this.rruleSet.all((_: Date, i: number) => i < 1)[0]
    }
    this.makeInst = makeInst
  }

  protected makeInstance(timeframe?: Timeframe): T {
    const target = clone(this.source)

    return this.isRecurrence && timeframe
      ? this.makeInst(target, timeframe)
      : this.makeInst(target)
  }

  isRecurrent(): boolean {
    return this.isRecurrence
  }

  next(): IteratorResult<T | undefined> {
    const doneRet = { value: undefined, done: true }

    if (this.done) {
      return doneRet
    }

    if (!this.isRecurrence) {
      this.done = true
      return { value: this.makeInstance(), done: false }
    }

    if (!this.startDateCursor) {
      this.done = true
      return doneRet
    }

    const eventSpan = this.getOneTimeframeFromRecurrence(this.startDateCursor)
    if (!eventSpan) {
      this.done = true
      return doneRet
    }

    const result = {
      value: this.makeInstance(eventSpan),
      done: false
    }
    this.startDateCursor = this.rruleSet.after(eventSpan.startDate)
    return result
  }

  private getOneTimeframeFromRecurrence(
    unadjustedStartDate: Date,
    include: boolean = true
  ): Timeframe | null {
    // unadjustedStartDate 可能未经 this.rrule.after 过滤，有可能是
    // 一个 exdate（被 rruleset 剔除的日期），发现时需要跳过。
    const startDate = this.rruleSet.after(unadjustedStartDate, include)

    return startDate
      ? { startDate, endDate: new Date(startDate.valueOf() + this.duration) }
      : null
  }

  private takePred = (from: Date, fromCmpOption: CmpOption) =>
    (eSpan?: Timeframe): boolean | TimeframeFrom => {
      switch (fromCmpOption) {
        case 'byStartDate':
          // 用开始时间来判断一个实例是否应该出现在当前区间的话，它可以晚于或等于 from
          return eSpan ? eSpan.startDate >= from : {
            startDateFrom: from,
            include: true
          }
        case 'byEndDate':
          // 用结束时间来判断一个实例是否应该出现在当前区间的话，它必须要严格晚于 from
          return eSpan ? eSpan.endDate > from : {
            startDateFrom: new Date(from.valueOf() - this.duration),
            include: false
          }
      }
    }

  private slice(
    from: Date, fromCmpOption: CmpOption,
    to: Date, toCmpOption: CmpOption
  ): Timeframe[] {
    const takePred = this.takePred(from, fromCmpOption)

    const stopPred = (eSpan: Timeframe): boolean => {
      // 用开始时间来判断一个实例是否应该出现在当前区间的话，它必须严格早于 to
      return toCmpOption === 'byStartDate' && eSpan.startDate >= to
      // 用结束时间来判断一个实例是否应该出现在当前区间的话，它可以早于或等于 to
        || toCmpOption === 'byEndDate' && eSpan.endDate > to
    }

    const result: Timeframe[] = []
    let initialEventSpan: Timeframe | null

    if (!this.isRecurrence) {
      initialEventSpan = {
        startDate: new Date(this.source.startDate),
        endDate: new Date(this.source.endDate)
      }
      if (takePred(initialEventSpan) as boolean && !stopPred(initialEventSpan)) {
        // eventSpan 在时间范围内
        result.push(initialEventSpan)
      }
      return result
    }
    // this.isRecurrence is truthy

    {
      const { startDateFrom, include } = takePred() as TimeframeFrom
      initialEventSpan = this.getOneTimeframeFromRecurrence(startDateFrom, include)
    }

    if (!initialEventSpan) {
      return []
    }

    let curr: Timeframe | null
    for (
      curr = initialEventSpan;
      curr !== null;
      curr = this.getOneTimeframeFromRecurrence(curr.startDate, false)
    ) {
      // note: 任何一个 time frame 都需要通过 stopPred 才可以用，initialEventSpan 也不例外
      if (stopPred(curr)) {
        break
      }
      result.push(curr)
    }

    return result
  }

  takeUntil(startDateUntil: Date, endDateUntil?: Date) {
    return this.takeFrom(
      new Date(this.source.startDate),
      startDateUntil,
      endDateUntil
    )
  }

  takeFrom(fromDate: Date, startDateTo: Date, endDateTo?: Date) {
    let toDate = startDateTo
    let toCmpOption: 'byStartDate' | 'byEndDate'

    if (!endDateTo || (endDateTo.valueOf() >= startDateTo.valueOf() + this.duration)) {
      toCmpOption = 'byStartDate'
    } else {
      toDate = endDateTo
      toCmpOption = 'byEndDate'
    }

    return this.slice(
      fromDate, 'byEndDate',
      toDate, toCmpOption
    ).map((eventSpan) => this.makeInstance(eventSpan))
  }

  after(date: Date): T | null {
    if (!this.isRecurrence) {
      if (new Date(this.source.startDate) < date) {
        return null
      } else {
        return this.makeInstance()
      }
    }
    // this.isRecurrence is truthy
    const targetEventSpan = this.getOneTimeframeFromRecurrence(date)
    if (!targetEventSpan) {
      return null
    } else {
      return this.makeInstance(targetEventSpan)
    }
  }

  findByTimestamp(timestamp: number): T | null {
    const expectedDate = new Date(timestamp)
    if (isNaN(timestamp) || isNaN(expectedDate.valueOf())) {
      return null
    }
    // expectedDate is a valid Date object

    const targetEventSpan = this.getOneTimeframeFromRecurrence(expectedDate)
    if (!targetEventSpan || targetEventSpan.startDate.valueOf() !== expectedDate.valueOf()) {
      return null
    }
    return this.makeInstance(targetEventSpan)
  }
}

export class EventGenerator extends RecurrenceFactory<EventSchema> {
  private static makeInst: InstanceCreator<EventSchema> = (event, timeframe?: Timeframe) =>
    !timeframe ? event : Object.assign(event, {
      _id: `${event._id}_${timeframe.startDate.valueOf()}`,
      startDate: timeframe.startDate.toISOString(),
      endDate: timeframe.endDate.toISOString()
    })

  constructor(event: EventSchema) {
    super(event, 'event', EventGenerator.makeInst)
  }

  findByEventId(eventId: EventId) {
    const originEventId = this.source._id

    if (!this.isRecurrent()) {
      return eventId === originEventId ? this.makeInstance() : null
    }

    const [ id, timestampStr ] = eventId.split('_', 2)
    if (id !== originEventId) {
      return null
    }

    // 不使用 parseInt 因为不应该兼容前缀正确的错误 timestamp
    return this.findByTimestamp(Number(timestampStr))
  }
}

export class Recurrence extends RecurrenceFactory<DateInfo> {
  private static makeInst: InstanceCreator<DateInfo> = (dateInfo, timeframe?: Timeframe) =>
    !timeframe ? dateInfo : Object.assign(dateInfo, {
      startDate: timeframe.startDate.toISOString(),
      endDate: timeframe.endDate.toISOString()
    })

  constructor(dateInfo: DateInfo) {
    super(dateInfo, 'dateInfo', Recurrence.makeInst)
  }
}
