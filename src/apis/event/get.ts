import { Observable } from 'rxjs/Observable'
import { QueryToken } from 'reactivedb'
import { SDKFetch } from '../../SDKFetch'
import { SDK } from '../../SDK'
import { EventData } from '../../schemas/Event'
import { EventGenerator } from './EventGenerator'
import { replaceToken } from '../utils'
import { EventId } from 'teambition-types'

export function getEventFetch(
  this: SDKFetch,
  eventId: EventId,
  query?: any
): Observable<EventData[]> {
  return this.get<EventData[]>(`/events/${eventId}`, query)
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
): QueryToken<IterableIterator<EventData>> {
  const token: QueryToken<any> = this.lift<EventData>({
    cacheValidate: 'cache',
    tableName: 'Event',
    request: this.fetch.getEvent(eventId, query),
    query: {
      where: { _id: eventId }
    },
    assoFields: {
      creator: [ '_id', 'name', 'avatarUrl' ]
    },
    excludeFields: [ 'project' ]
  })

  return replaceToken(token, (r: EventData[]) => r.map(e => new EventGenerator(e)))
}

SDK.prototype.getEvent = getEvent

declare module '../../SDK' {
  interface SDK {
    getEvent: typeof getEvent
  }
}
