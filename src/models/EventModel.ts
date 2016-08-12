'use strict'
import { Observable } from 'rxjs/Observable'
import Model from './BaseModel'
import { EventData } from '../schemas/Event'
import { setSchema } from '../schemas/schema'
import { RecurrenceEvent } from './events/RecurrenceEvent'

export interface GeneratorResult {
  value: EventData
  done: boolean
}

export class EventModel extends Model {
  // private _schemaName = 'event'

  private _recurrenceEventAlias = new Map<string, string>()

  desctructor() {
    this._recurrenceEventAlias.clear()
  }

  addOne(event: EventData): Observable<RecurrenceEvent> {
    const result = setSchema( new RecurrenceEvent(event), event )
    if (event._sourceId && event._sourceId !== event._id) {
      this._recurrenceEventAlias.set(event._sourceId + event.startDate, event._id)
    }
    return this._save(result)
  }

  get(eventId: string): Observable<EventData> {
    return this._get<EventData>(eventId)
  }

  getByAlias(aliasId: string): Observable<EventData> {
    const id = this._recurrenceEventAlias.get(aliasId)
    if (!id) {
      return Observable.throw(new Error(`no valid alias, aliasId: ${aliasId}, alias: ${this._recurrenceEventAlias}`))
    }
    return this._get<EventData>(id)
  }
}

export default new EventModel()
