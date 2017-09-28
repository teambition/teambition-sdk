import { EventSchema } from '../../schemas/Event'
import { isRecurrent } from './utils'
import { clone } from '../../utils'
import { EventId } from 'teambition-types'

const { rrulestr } = require('rrule')

type Timeframe = { startDate: Date, endDate: Date }

export class EventGenerator implements IterableIterator<EventSchema | undefined> {
  type: 'event' = 'event'
  _id: EventId

  private done: boolean
  private rrule: any
  private startDateCursor: Date
  private isRecurrence = isRecurrent(this.event)
  private duration: number

  [Symbol.iterator] = () => this

  constructor(private event: EventSchema) {
    this._id = event._id
    this.done = false

    const startDateObj = new Date(event.startDate)
    const endDateObj = new Date(event.endDate)
    this.duration = endDateObj.valueOf() - startDateObj.valueOf()

    if (this.isRecurrence) {
      this.startDateCursor = startDateObj
      this.rrule = rrulestr(this.event.recurrence.join('\n'), { forceset: true })
    }
  }

  // 从给予的 startDate 和 endDate 生成一个 EventSchema 对象；
  // 当用于普通日程，不需要提供参数。
  private makeEvent(timeframe?: Timeframe): EventSchema {
    const target = clone(this.event)

    if (!this.isRecurrence || !timeframe) {
      return target
    }
    // this.isRecurrence && timeframe

    const timestamp = timeframe.startDate.valueOf()
    target._id = `${target._id}_${timestamp}`
    target.startDate = timeframe.startDate.toISOString()
    target.endDate = timeframe.endDate.toISOString()

    return target
  }

  private getOneTimeframeFromRecurrence(
    unadjustedStartDate: Date,
    include: boolean = true
  ): Timeframe | null {
    // unadjustedStartDate 可能未经 this.rrule.after 过滤，有可能是
    // 一个 exdate（被 rruleset 剔除的日期），发现时需要跳过。
    const startDate = this.rrule.after(unadjustedStartDate, include)
    if (startDate) {
      const endDate = this.computeEndDate(startDate)
      return { startDate, endDate }
    } else {
      return null
    }
  }

  private computeEndDate(startDate: Date): Date {
    return new Date(startDate.valueOf() + this.duration)
  }

  private slice(
    from: Date, fromCmpOption: 'byStartDate' | 'byEndDate',
    to: Date, toCmpOption: 'byStartDate' | 'byEndDate'
  ): Timeframe[] {
    const skipPred = (eSpan: Timeframe): boolean =>
      fromCmpOption === 'byStartDate' && eSpan.startDate < from
      || fromCmpOption === 'byEndDate' && eSpan.endDate < from

    const stopPred = (eSpan: Timeframe): boolean =>
      toCmpOption === 'byStartDate' && eSpan.startDate > to
      || toCmpOption === 'byEndDate' && eSpan.endDate > to

    const result: Timeframe[] = []
    let initialEventSpan: Timeframe | null

    if (!this.isRecurrence) {
      initialEventSpan = {
        startDate: new Date(this.event.startDate),
        endDate: new Date(this.event.endDate)
      }
      if (!skipPred(initialEventSpan) && !stopPred(initialEventSpan)) {
        // eventSpan 在时间范围内
        result.push(initialEventSpan)
      }
      return result
    }
    // this.isRecurrence is truthy

    initialEventSpan = this.getOneTimeframeFromRecurrence(new Date(this.event.startDate))
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

  next(): IteratorResult<EventSchema | undefined> {
    const doneRet = { value: undefined, done: true }

    if (this.done) {
      return doneRet
    }

    if (!this.isRecurrence) {
      this.done = true
      return { value: this.makeEvent(), done: false }
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
      value: this.makeEvent(eventSpan),
      done: false
    }
    this.startDateCursor = this.rrule.after(eventSpan.startDate)
    return result
  }

  takeUntil(startDateUntil: Date, endDateUntil?: Date) {
    return this.takeFrom(
      new Date(this.event.startDate),
      startDateUntil,
      endDateUntil
    )
  }

  takeFrom(fromDate: Date, startDateTo: Date, endDateTo?: Date) {
    const toDate = !endDateTo ? startDateTo : new Date(
      Math.min(
        startDateTo.valueOf(),
        endDateTo.valueOf() - this.duration
      )
    )
    return this.slice(
      fromDate, 'byEndDate',
      toDate, 'byStartDate'
    ).map((eventSpan) => this.makeEvent(eventSpan))
  }

  after(date: Date): EventSchema | null {
    if (!this.isRecurrence) {
      if (new Date(this.event.startDate) < date) {
        return null
      } else {
        return this.event
      }
    }
    // this.isRecurrence is truthy
    const targetEventSpan = this.getOneTimeframeFromRecurrence(date)
    if (!targetEventSpan) {
      return null
    } else {
      return this.makeEvent(targetEventSpan)
    }
  }

  findByEventId(eventId: EventId): EventSchema | null {
    if (!this.isRecurrence) {
      return eventId === this.event._id ? this.makeEvent() : null
    }

    const [id, timestampStr] = eventId.split('_', 2)
    if (id !== this.event._id) {
      return null
    }

    // 不使用 parseInt 因为不应该兼容前缀正确的错误 timestamp
    const timestamp = Number(timestampStr)
    const expectedDate = new Date(timestamp)
    if (isNaN(timestamp) || isNaN(expectedDate.valueOf())) {
      return null
    }
    // expectedDate is a valid Date object

    const targetEventSpan = this.getOneTimeframeFromRecurrence(expectedDate)
    if (!targetEventSpan || targetEventSpan.startDate.valueOf() !== expectedDate.valueOf()) {
      return null
    }
    return this.makeEvent(targetEventSpan)
  }
}
