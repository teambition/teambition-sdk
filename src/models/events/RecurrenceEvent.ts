'use strict'
import { EventData } from '../../schemas/Event'
import { clone, assign } from '../../utils/index'
import EventSchema from '../../schemas/Event'

const { rrulestr } = require('rrule')

export interface GeneratorResult {
  value: TRecurrenceEvent
  done: boolean
}

export interface IRecurrenceEvent extends EventData {
  setStart(date?: Date): void
  next(): GeneratorResult
  take(count: number): GeneratorResult[]
}

export type TRecurrenceEvent = IRecurrenceEvent & RecurrenceEvent

export class RecurrenceEvent extends EventSchema implements IRecurrenceEvent {
  public recurrence: string[]

  private _recurrence: any
  private _startDate: Date
  // 结束时间与开始时间间隔的毫秒数
  private _interval: number
  private _isRecurrenceEvent = false

  constructor(_event: EventData) {
    super()
    const recurrence = _event.recurrence
    this._startDate = new Date(_event.startDate)
    this._interval = new Date(_event.endDate).valueOf() - new Date(_event.startDate).valueOf()
    /** istanbul ignore if */
    if (recurrence && recurrence.length) {
      this._recurrence = rrulestr(recurrence.join('\n'), { forceset: true })
      this._interval = new Date(_event.endDate).valueOf() - new Date(_event.startDate).valueOf()
      this._isRecurrenceEvent = true
    }
    this.recurrence = _event.recurrence
    Object.defineProperty(this, 'recurrence', {
      get() {
        return _event.recurrence
      },
      set (rec: string[]) {
        if (rec && rec instanceof Array && rec.length) {
          this._recurrence = rrulestr(rec.join('\n'), { forceset: true })
          this._isRecurrenceEvent = true
        } else {
          this._isRecurrenceEvent = false
        }
        _event.recurrence = rec
      }
    })
    assign(this, _event)
  }

  setStart(date?: Date): void {
    this._checkRecurrence()
    this._startDate = date
  }

  next(): GeneratorResult {
    this._checkRecurrence()
    let result: TRecurrenceEvent
    const startDate = this._recurrence.after(this._startDate)
    const startDateObj = new Date(startDate)
    if (startDate) {
      result = this.clone()
      result.startDate = startDate
      result.endDate = this._genNewEnd(startDateObj)
      // mock 出来的日程 _id 为原始 _id + startDate 的 ISOString
      result._id = <any>(result._id + '&' + startDateObj.toISOString())
      this.setStart(startDateObj)
    }
    return {
      value: result,
      done: !startDate
    }
  }

  take(count: number): GeneratorResult[] {
    this._checkRecurrence()
    let i = 0
    const result: GeneratorResult[] = []
    while (i ++ < count) {
      result.push(this.next())
    }
    return result
  }

  takeUntilTime(time: Date): GeneratorResult[] {
    this._checkRecurrence()
    const result: GeneratorResult[] = []
    while (new Date(this._startDate).valueOf() < time.valueOf()) {
      result.push(this.next())
    }
    return result
  }

  takeByTime(time: Date): EventData {
    this._checkRecurrence()
    let startDate = this.startDate
    const timeVal = time.valueOf()
    let startVal = new Date(startDate).valueOf()
    while (startVal < timeVal) {
      startDate = this._recurrence.after(new Date(startDate))
      if (!startDate) {
        break
      }
      startVal = new Date(startDate).valueOf()
    }
    if (startVal === timeVal) {
      const result = clone(this)
      const startDateObject = new Date(startDate)
      result._id = <any>(this._id + '&' + startDateObject.toISOString())
      result.startDate = startDateObject.toISOString()
      result.endDate = this._genNewEnd(startDateObject)
      return result
    } else {
      return null
    }
  }

  isBetween(startDate: Date, endDate: Date | 'feature'): boolean {
    const eventStartDate = new Date(this.startDate).valueOf()
    const eventEndDate = new Date(this.endDate).valueOf()
    if (!this._recurrence) {
      if (endDate === 'feature') {
        return eventStartDate > startDate.valueOf() || eventEndDate > startDate.valueOf()
      } else {
        return eventStartDate < startDate.valueOf() || eventEndDate > endDate.valueOf()
      }
    } else {
      if (endDate === 'feature') {
        return !!this._recurrence.after(startDate)
      } else {
        return !!this._recurrence.between(startDate, endDate).length
      }
    }
  }

  clone() {
    return new RecurrenceEvent(this)
  }

  /**
   * 生成新的开始时间，截止时间
   */
  private _genNewEnd(newDate: Date): string {
    const newEnd = new Date(newDate.valueOf() + this._interval)
    return newEnd.toISOString()
  }

  private _checkRecurrence() {
    if (!this._isRecurrenceEvent) {
      throw new Error(`this is not a recurrence event: ${JSON.stringify(this.$$data)}`)
    }
  }
}
