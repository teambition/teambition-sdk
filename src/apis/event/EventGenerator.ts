import { EventSchema } from '../../schemas/Event'
import { isRecurrence } from './utils'
import { clone } from '../../utils'
import { EventId } from 'teambition-types'

const { rrulestr } = require('rrule')

type TimeFrame = { startDate: Date, endDate: Date }

export class EventGenerator implements IterableIterator<EventSchema | undefined> {
  type: 'event' = 'event'
  _id: EventId

  private done: boolean
  private rrule: any
  private startDate: Date
  private isRecurrence = isRecurrence(this.event)
  private duration: number

  [Symbol.iterator] = () => this

  constructor(private event: EventSchema) {
    this._id = event._id
    this.done = false

    const startDateObj = new Date(event.startDate)
    const endDateObj = new Date(event.endDate)
    this.duration = endDateObj.valueOf() - startDateObj.valueOf()

    if (this.isRecurrence) {
      this.startDate = startDateObj
      this.rrule = rrulestr(this.event.recurrence.join('\n'), { forceset: true })
    }
  }

  // 从给予的 startDate 和 endDate 生成一个 EventSchema 对象；
  // 当用于普通日程，不需要提供参数。
  private makeEvent(timeFrame?: TimeFrame): EventSchema {
    const target = clone(this.event)

    if (!this.isRecurrence || !timeFrame) {
      return target
    }
    // this.isRecurrence && timeFrame

    const timestamp = timeFrame.startDate.valueOf()
    target._id = `${target._id}_${timestamp}`
    target.startDate = timeFrame.startDate.toISOString()
    target.endDate = timeFrame.endDate.toISOString()

    return target
  }

  private computeEndDate(startDate: Date): Date {
    return new Date(startDate.valueOf() + this.duration)
  }

  private slice(
    from: Date, fromCmpOption: 'byStartDate' | 'byEndDate',
    to: Date, toCmpOption: 'byStartDate' | 'byEndDate'
  ): TimeFrame[] {
    let startDate = new Date(this.event.startDate)
    let endDate = new Date(this.event.endDate)
    let eventSpan = { startDate, endDate }

    const skipPred = (eSpan: TimeFrame): boolean =>
      fromCmpOption === 'byStartDate' && eSpan.startDate < from
      || fromCmpOption === 'byEndDate' && eSpan.endDate < from

    const stopPred = (eSpan: TimeFrame): boolean =>
      toCmpOption === 'byStartDate' && eSpan.startDate > to
      || toCmpOption === 'byEndDate' && eSpan.endDate > to

    const result: TimeFrame[] = []

    if (!this.isRecurrence) {
      if (!skipPred(eventSpan) && !stopPred(eventSpan)) {
        // eventSpan 在时间范围内
        result.push({ startDate, endDate })
      }
      return result
    }

    for (; startDate; startDate = this.rrule.after(startDate)) {
      endDate = this.computeEndDate(startDate)
      eventSpan = { startDate, endDate }
      if (stopPred(eventSpan)) { // 优先检查停止条件
        break
      }
      if (skipPred(eventSpan)) { // 其次检查忽略条件
        continue
      }
      // eventSpan 在时间范围内
      result.push(eventSpan)
    }
    return result
  }

  next(): IteratorResult<EventSchema | undefined> {
    const doneRet = { value: undefined, done: true }

    if (!this.isRecurrence) {
      if (this.done) {
        return doneRet
      } else {
        this.done = true
        return { value: this.makeEvent(), done: false }
      }
    }

    if (!this.startDate) {
      return doneRet
    }
    // 不直接将 this.startDate 赋给 startDate 的原因是：
    //   如果这是第一次 next() 调用，this.startDate 未经 after 过滤，
    //   有可能是一个 exdate（被 rruleset 剔除的日期），发现时需要跳过。
    const startDate = this.rrule.after(this.startDate, true)
    const endDate = this.computeEndDate(startDate)
    const result = {
      value: this.makeEvent({ startDate, endDate }),
      done: false
    }
    this.startDate = this.rrule.after(startDate)
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

  after(date: Date) {
    if (!this.isRecurrence) {
      if (new Date(this.event.startDate) < date) {
        return undefined
      } else {
        return this.event
      }
    }
    const startDate = this.rrule.after(date, true)
    if (!startDate) {
      return undefined
    }
    const endDate = this.computeEndDate(startDate)
    return this.makeEvent({ startDate, endDate })
  }

  findByEventId(eventId: EventId): EventSchema | undefined {
    if (!this.isRecurrence) {
      return eventId === this.event._id ? this.makeEvent() : undefined
    }

    const [id, timestampStr] = eventId.split('_', 2)
    if (id !== this.event._id) {
      return undefined
    }

    // 不使用 parseInt 因为不应该兼容前缀正确的错误 timestamp
    const timestamp = Number(timestampStr)
    const expectedDate = new Date(timestamp)
    if (isNaN(timestamp) || isNaN(expectedDate.valueOf())) {
      return undefined
    }
    // expectedDate is a valid Date object

    const actualDate: Date = this.rrule.after(expectedDate, true)
    if (!actualDate || actualDate.valueOf() !== expectedDate.valueOf()) {
      return undefined
    }

    return this.makeEvent({
      startDate: expectedDate,
      endDate: this.computeEndDate(expectedDate)
    })
  }
}
