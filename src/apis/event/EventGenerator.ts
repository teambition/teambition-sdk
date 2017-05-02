import { EventSchema } from '../../schemas/Event'
import { isRecurrence } from './utils'
import { clone } from '../../utils'
import { EventId } from 'teambition-types'

const { rrulestr } = require('rrule')

export class EventGenerator implements IterableIterator<EventSchema> {
  type: 'event' = 'event'
  _id: EventId

  private rrule: any
  private startDate: Date
  private isRecurrence = isRecurrence(this.event)
  private interval: number

  [Symbol.iterator] = () => this

  constructor(private event: EventSchema) {
    this._id = event._id
    if (this.isRecurrence) {
      const startDateObj = new Date(event.startDate)
      const endDateObj = new Date(event.endDate)
      this.interval = endDateObj.valueOf() - startDateObj.valueOf()
      this.startDate = startDateObj
      this.rrule = rrulestr(this.event.recurrence.join('\n'), { forceset: true })
    }
  }

  next(): IteratorResult<EventSchema> {
    if (!this.isRecurrence) {
      return { value: clone(this.event), done: true }
    }
    const target = clone(this.event)
    const startDateVal = this.startDate.valueOf()
    const afterDate = this.rrule.after(this.startDate)
    target._id = `${target._id}_${startDateVal}`
    target.startDate = this.startDate.toISOString()
    target.endDate = new Date(startDateVal + this.interval).toISOString()
    const result = {
      done: !!afterDate,
      value: target
    }
    this.startDate = afterDate
    return result
  }

  takeUntil(endDate: Date) {
    if (!this.isRecurrence) {
      return [ clone(this.event) ]
    }
    const result: EventSchema[] = []
    let s = new Date(this.event.startDate)
    let sv = s.valueOf()
    let e = new Date(this.event.endDate)
    while (sv < endDate.valueOf()) {
      const r = clone(this.event)
      r._id = `${ r._id }_${ sv }`
      r.startDate = s.toISOString()
      r.endDate = e.toISOString()
      result.push(r)
      s = this.rrule.after(s)
      if (!s) {
        break
      }
      sv = s.valueOf()
      e = new Date(sv + this.interval)
    }
    return result
  }

  takeFrom(startDate: Date, endDate: Date) {
    if (!this.isRecurrence) {
      if (
        (new Date(this.event.startDate).valueOf() < endDate.valueOf()) &&
        (new Date(this.event.endDate).valueOf() > startDate.valueOf())
      ) {
        return [ clone(this.event) ]
      } else {
        return []
      }
    }
    let s = this.rrule.after(startDate)
    if (!s) {
      return []
    }
    let sv = s.valueOf()
    let e = new Date(sv + this.interval)
    const result: EventSchema[] = []
    while (sv < endDate.valueOf()) {
      const r = clone(this.event)
      r._id = `${ r._id }_${ sv }`
      r.startDate = s.toISOString()
      r.endDate = e.toISOString()
      result.push(r)
      s = this.rrule.after(s)
      if (!s) {
        break
      }
      sv = s.valueOf()
      e = new Date(sv + this.interval)
    }
    return result
  }
}
