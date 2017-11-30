import { EventSchema } from '../../schemas/Event'
import {
  isRecurrent,
  normFromAllDayAttrs,
  rruleSetMethodWrapper,
  allDayRRuleSetMethodWrapper
} from './utils'
import { clone } from '../../utils'
import { EventId } from 'teambition-types'

const { rrulestr } = require('rrule')

type Timeframe = { startDate: Date, endDate: Date }

export interface DateInfo {
  startDate: string,
  endDate: string,
  recurrence?: string[],
  isAllDay: boolean
}

type InstanceCreator<T> = (source: T, timeframe?: Timeframe) => T

export interface RecurrenceInstance<T> extends IterableIterator<T | undefined> {
  type: string
  isRecurrent(): boolean
  next(): IteratorResult<T | undefined>
  takeUntil(startDateUntil: Date, endDateUntil?: Date): T[]
  takeFrom(fromDate: Date, startDateTo: Date, endDateTo?: Date): T[]
  after(date: Date): T | null
  findByTimestamp(timestamp: number): T | null
}

export interface RecurrenceClass<T> {
  new(source: T & DateInfo): RecurrenceInstance<T>
}

const createRecur = <T>(type: string, makeInst: InstanceCreator<T>): RecurrenceClass<T> => {
  return class implements IterableIterator<T | undefined> {
    type = type

    private source: T & DateInfo

    private startDateCursor: Date | undefined
    private done: boolean
    private makeInst: InstanceCreator<T>

    private duration: number
    private isRecurrence: boolean
    private rrule: (method: string, ...args: any[]) => any

    [Symbol.iterator] = () => this

    constructor(event: T & DateInfo) {
      this.source = event.isAllDay ? normFromAllDayAttrs(event) as T & DateInfo : event

      this.done = false

      this.duration = new Date(this.source.endDate).valueOf()
        - new Date(this.source.startDate).valueOf()

      this.isRecurrence = isRecurrent(this.source)
      if (this.isRecurrence) {
        const rruleSet = rrulestr(this.source.recurrence!.join('\n'), { forceset: true })
        this.rrule = this.source.isAllDay
          ? allDayRRuleSetMethodWrapper(rruleSet)
          : rruleSetMethodWrapper()(rruleSet)
        this.startDateCursor = rruleSet.all((_: Date, i: number) => i < 1)[0]
      }
      this.makeInst = makeInst
    }

    private makeInstance(timeframe?: Timeframe): T {
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
      this.startDateCursor = this.rrule('after', eventSpan.startDate)
      return result
    }

    private getOneTimeframeFromRecurrence(
      unadjustedStartDate: Date,
      include: boolean = true
    ): Timeframe | null {
      // unadjustedStartDate 可能未经 this.rrule.after 过滤，有可能是
      // 一个 exdate（被 rruleset 剔除的日期），发现时需要跳过。
      const startDate = this.rrule('after', unadjustedStartDate, include)

      return startDate
        ? { startDate, endDate: new Date(startDate.valueOf() + this.duration) }
        : null
    }

    private slice(
      from: Date, fromCmpOption: 'byStartDate' | 'byEndDate',
      to: Date, toCmpOption: 'byStartDate' | 'byEndDate'
    ): Timeframe[] {
      const skipPred = (eSpan: Timeframe): boolean =>
        // 用开始时间来判断一个实例是否应该出现在当前区间的话，它可以晚于或等于 from
        fromCmpOption === 'byStartDate' && eSpan.startDate < from
        // 用结束时间来判断一个实例是否应该出现在当前区间的话，它必须要严格晚于 from
        || fromCmpOption === 'byEndDate' && eSpan.endDate <= from

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
        if (!skipPred(initialEventSpan) && !stopPred(initialEventSpan)) {
          // eventSpan 在时间范围内
          result.push(initialEventSpan)
        }
        return result
      }
      // this.isRecurrence is truthy

      initialEventSpan = this.getOneTimeframeFromRecurrence(new Date(this.source.startDate))
      if (!initialEventSpan) {
        return []
      }

      let curr: Timeframe | null
      for (
        curr = initialEventSpan;
        curr !== null;
        curr = this.getOneTimeframeFromRecurrence(curr.startDate, false)
      ) {
        if (stopPred(curr)) { // 优先检查停止条件
          break
        }
        if (skipPred(curr)) { // 其次检查忽略条件
          continue
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

      if (!endDateTo || startDateTo.valueOf() + this.duration <= endDateTo.valueOf()) {
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
}

export const findByEventId = (eventGen: EventGenerator, eventId: EventId): EventSchema | null => {
  const originEventId = eventGen['source']._id

  if (!eventGen['isRecurrence']) {
    return eventId === originEventId ? eventGen['makeInstance']() : null
  }

  const [id, timestampStr] = eventId.split('_', 2)
  if (id !== originEventId) {
    return null
  }

  // 不使用 parseInt 因为不应该兼容前缀正确的错误 timestamp
  return eventGen.findByTimestamp(Number(timestampStr))
}

export const EventGenerator = createRecur<EventSchema>(
  'event',
  (event, timeframe?: Timeframe) =>
    !timeframe ? event : Object.assign(event, {
      _id: `${event._id}_${timeframe.startDate.valueOf()}`,
      startDate: timeframe.startDate.toISOString(),
      endDate: timeframe.endDate.toISOString()
    })
)
export interface EventGenerator extends RecurrenceInstance<EventSchema> {}

export const Recurrence = createRecur<DateInfo>(
  'dateinfo',
  (dateInfo, timeframe?: Timeframe) =>
    !timeframe ? dateInfo : Object.assign(dateInfo, {
      startDate: timeframe.startDate.toISOString(),
      endDate: timeframe.endDate.toISOString()
    })
)

export interface Recurrence extends RecurrenceInstance<DateInfo> {}
