import { Observable } from 'rxjs/Observable'
import { QueryToken } from 'reactivedb'
import { SDKFetch } from '../../SDKFetch'
import { SDK, CacheStrategy } from '../../SDK'
import { EventSchema } from '../../schemas/Event'
import { EventGenerator } from './EventGenerator'
import { EventId } from 'teambition-types'

export function getEventFetch(
  this: SDKFetch,
  eventId: EventId,
  query?: any
): Observable<EventSchema[]> {
  return this.get<EventSchema[]>(`events/${eventId}`, query)
}

SDKFetch.prototype.getEvent = getEventFetch

declare module '../../SDKFetch' {
  interface SDKFetch {
    getEvent: typeof getEventFetch
  }
}

export function getEvent(
  this: SDK,
  eventId: EventId,
  query?: any
): QueryToken<IterableIterator<EventSchema>> {
  const token: QueryToken<any> = this.lift<EventSchema>({
    cacheValidate: CacheStrategy.Cache,
    tableName: 'Event',
    request: this.fetch.getEvent(eventId, query),
    query: {
      where: { _id: eventId }
    },
    assocFields: {
      creator: [ '_id', 'name', 'avatarUrl' ]
    },
    excludeFields: [ 'project' ]
  })

  return token.map((e: EventSchema) => new EventGenerator(e))
}

SDK.prototype.getEvent = getEvent

declare module '../../SDK' {
  interface SDK {
    getEvent: typeof getEvent
  }
}
