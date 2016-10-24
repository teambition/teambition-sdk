'use strict'
import 'rxjs/add/observable/throw'
import { Observable } from 'rxjs/Observable'
import Model from './BaseModel'
import { EventData } from '../schemas/Event'
import { setSchema } from '../schemas/schema'
import { RecurrenceEvent } from './events/RecurrenceEvent'
import Collection from './BaseCollection'
import { forEach } from '../utils'

export interface GeneratorResult {
  value: EventData
  done: boolean
}

export class EventModel extends Model {
  private _schemaName = 'Event'

  private _recurrenceEventAlias = new Map<string, string>()

  constructor() {
    super()
    EventModel.TeardownLogics.add(() => {
      this._recurrenceEventAlias.clear()
    })
  }

  addOne(event: EventData): Observable<RecurrenceEvent> {
    const result = setSchema<any>( new RecurrenceEvent(event), event )
    if (event._sourceId && event._sourceId !== event._id) {
      this._recurrenceEventAlias.set(event._sourceId + event.startDate, event._id)
    }
    return this._save<RecurrenceEvent>(result)
  }

  get(eventId: string): Observable<RecurrenceEvent> {
    return this._get<RecurrenceEvent>(eventId)
  }

  getByAlias(aliasId: string): Observable<RecurrenceEvent> {
    const id = this._recurrenceEventAlias.get(aliasId)
    if (!id) {
      return Observable.throw(new Error(`no valid alias, aliasId: ${aliasId}, alias: ${this._recurrenceEventAlias}`))
    }
    return this._get<RecurrenceEvent>(id)
  }

  addProjectEvents(projectId: string, events: EventData[], startDate: Date, endDate: Date | 'feature' = 'feature'): Observable<RecurrenceEvent[]> {
    const result = this._genEventResult(events)
    const dbIndex = `project:events/${projectId}/${startDate.valueOf()}/${endDate.valueOf()}`
    return this._saveCollection<any>(dbIndex, result, this._schemaName, (data: RecurrenceEvent) => {
      return !data.isArchived &&
             data._projectId === projectId &&
             data.isBetween(startDate, endDate)
    })
  }

  getProjectEvents(projectId: string, startDate: Date, endDate: Date | 'feature' = 'feature'): Observable<RecurrenceEvent[]> {
    return this._get<RecurrenceEvent[]>(`project:events/${projectId}/${startDate.valueOf()}/${endDate.valueOf()}`)
  }

  addMyEvents(userId: string, endDate: Date, events: EventData[]): Observable<EventData[]> {
    const result = this._genEventResult(events)
    return this._saveCollection<any>(`my:events/${userId}`, result, this._schemaName, (data: RecurrenceEvent) => {
      return !data.isArchived &&
             data.involveMembers &&
             data.involveMembers.indexOf(userId) !== -1 &&
             data.isBetween(endDate, 'feature')
    })
  }

  getMyEvents(userId: string, endDate: Date): Observable<EventData[]> {
    return this._get<EventData[]>(`my:events/${userId}`)
  }

  addByTagId(tagId: string, events: EventData[], page: number): Observable<EventData[]> {
    const dbIndex = `tag:events/${tagId}`
    const result = this._genEventResult(events)
    let collection = this._collections.get(dbIndex)

    if (!collection) {
      collection = new Collection(this._schemaName, (data: EventData) => {
        return !data.isArchived && data.tagIds && data.tagIds.indexOf(tagId) !== -1
      }, dbIndex)
      this._collections.set(dbIndex, collection)
    }
    return collection.addPage(page, result)
  }

  getByTagId(tagId: string, page: number): Observable<EventData[]> {
    const dbIndex = `tag:events:/${tagId}`
    let collection = this._collections.get(dbIndex)
    if (collection) {
      return collection.get(page)
    }
    return null
  }

  private _genEventResult(events: EventData[]): RecurrenceEvent[] {
    const results: any[] = []
    forEach(events, event => {
      const result = setSchema<any>( new RecurrenceEvent(event), event )
      if (event._sourceId && event._sourceId !== event._id) {
        this._recurrenceEventAlias.set(event._sourceId + event.startDate, event._id)
      }
      results.push(result)
    })
    return results
  }

}

export default new EventModel()
