'use strict'
import { Observable } from 'rxjs/Observable'
import Model from './BaseModel'
import { EventData } from '../schemas/event'
import { setSchema } from '../schemas/schema'
import { RecurrenceEvent } from './events/RecurrenceEvent'

export interface GeneratorResult {
  value: EventData
  done: boolean
}

export class EventModel extends Model {
  // private _schemaName = 'event'

  addOne(event: EventData): Observable<RecurrenceEvent> {
    const result = setSchema( new RecurrenceEvent(event), event )
    return this._save(result)
  }

  get(eventId: string): Observable<RecurrenceEvent> {
    return this._get<RecurrenceEvent>(eventId)
  }
}

export default new EventModel()
