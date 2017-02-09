import { EventData } from '../../schemas/Event'
import { isRecurrence } from './utils'
import { clone } from '../../utils'
const { rrulestr } = require('rrule')

export class EventGenerator implements IterableIterator<EventData> {
  private rrule: any
  private startDate: Date
  private isRecurrence = isRecurrence(this.event)
  private interval: number

  [Symbol.iterator] = () => this

  constructor(private event: EventData) {
    if (this.isRecurrence) {
      const startDateObj = new Date(event.startDate)
      const endDateObj = new Date(event.endDate)
      this.interval = endDateObj.valueOf() - startDateObj.valueOf()
      this.startDate = startDateObj
      this.rrule = rrulestr(this.event.recurrence.join('\n'), { forceset: true })
    }
  }

  next(): IteratorResult<EventData> {
    if (!this.isRecurrence) {
      return { value: clone(this.event), done: true }
    }
    const target = clone(this.event)
    const startDateVal = this.startDate.valueOf()
    target._id = `${target._id}_${startDateVal}`
    target.startDate = this.startDate.toISOString()
    target.endDate = new Date(startDateVal + this.interval).toISOString()
    const result = {
      done: !!this.rrule.after(this.startDate),
      value: target
    }
    this.startDate = this.rrule.after(this.startDate)
    return result
  }
}
