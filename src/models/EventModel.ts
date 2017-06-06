'use strict'
import 'rxjs/add/observable/throw'
import { Observable } from 'rxjs/Observable'
import Model from './BaseModel'
import { EventData } from '../schemas/Event'
import { setSchema } from '../schemas/schema'
import { RecurrenceEvent } from './events/RecurrenceEvent'
import Collection from './BaseCollection'
import { forEach } from '../utils'
import { EventId, ProjectId, UserId, TagId } from '../teambition'

export interface GeneratorResult {
  value: EventData
  done: boolean
}

export class EventModel extends Model {
  private _schemaName = 'Event'

  private _recurrenceEventAlias = new Map<string, EventId>()

  constructor() {
    super()
    EventModel.TeardownLogics.add(() => {
      this._recurrenceEventAlias.clear()
    })
  }

  addOne(event: EventData): Observable<RecurrenceEvent> {
    const result = setSchema<any>( new RecurrenceEvent(event), event )
    if (event._sourceId && event._sourceId !== event._id) {
      this._recurrenceEventAlias.set(event._sourceId + event.startDate, <any>event._id)
    }
    return this._save<RecurrenceEvent>(result)
  }

  get(eventId: EventId): Observable<RecurrenceEvent> {
    return this._get<RecurrenceEvent>(<any>eventId)
  }

  getByAlias(aliasId: string): Observable<RecurrenceEvent> {
    const id = this._recurrenceEventAlias.get(aliasId)
    return this._get<RecurrenceEvent>(<any>id)
  }

  addProjectEvents(
    projectId: ProjectId,
    events: EventData[],
    startDate: Date,
    endDate: Date | 'feature' = 'feature'
  ): Observable<RecurrenceEvent[]> {
    const result = this._genEventResult(events)
    const dbIndex = `project:events/${projectId}/${startDate.valueOf()}/${endDate.valueOf()}`
    return this._saveCollection<any>(dbIndex, result, this._schemaName, (data: RecurrenceEvent) => {
      return !data.isArchived &&
             data._projectId === projectId &&
             data.isBetween(startDate, endDate)
    })
  }

  getProjectEvents(
    projectId: ProjectId,
    startDate: Date,
    endDate: Date | 'feature' = 'feature'
  ): Observable<RecurrenceEvent[]> | null {
    return this._get<RecurrenceEvent[]>(`project:events/${projectId}/${startDate.valueOf()}/${endDate.valueOf()}`)
  }

  addMyEvents(userId: UserId, events: EventData[], page: number): Observable<EventData[]> {
    const dbIndex = `my:events/${userId}`
    const result = this._genEventResult(events)
    let collection = this._collections.get(dbIndex)
    if (!collection) {
      collection = new Collection(
        this._schemaName,
        (data: RecurrenceEvent) => {
          return !data.isArchived &&
              data.involveMembers &&
              data.involveMembers.indexOf(<any>userId) !== -1
        },
        dbIndex
      )
      this._collections.set(dbIndex, collection)
    }
    return collection.addPage(page, result)
  }

  getMyEvents(userId: UserId, page: number): Observable<EventData[]> {
    const dbIndex = `my:events/${userId}`
    const collection = this._collections.get(dbIndex)
    if (collection) {
      return collection.get(page)
    }
    return null
  }

  addByTagId(tagId: TagId, events: EventData[], page: number): Observable<EventData[]> {
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

  getByTagId(tagId: TagId, page: number): Observable<EventData[]> | null {
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

export default new EventModel
