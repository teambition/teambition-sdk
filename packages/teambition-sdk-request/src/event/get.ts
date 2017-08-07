import 'rxjs/add/operator/toArray'
import { Observable } from 'rxjs/Observable'
import { QueryToken } from 'reactivedb'
import { CacheStrategy, SDK, SDKFetch, EventSchema } from 'teambition-sdk-core'
import { EventId } from 'teambition-types'

import { EventGenerator } from './EventGenerator'

export function getEventFetch(
  this: SDKFetch,
  eventId: EventId,
  query?: any
): Observable<EventSchema[]> {
  return this.get<EventSchema[]>(`events/${eventId}`, query)
}

SDKFetch.prototype.getEvent = getEventFetch

declare module 'teambition-sdk-core/dist/cjs/SDKFetch' {
  // tslint:disable-next-line no-shadowed-variable
  interface SDKFetch {
    getEvent: typeof getEventFetch
  }
}

export function getEvent(
  this: SDK,
  eventId: EventId,
  query?: any
): QueryToken<EventGenerator> {
  const token: QueryToken<EventSchema> = this.lift<EventSchema>({
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

  return token.map(e$ => e$.map(events => events.map(e => new EventGenerator(e))))
}

SDK.prototype.getEvent = getEvent

declare module 'teambition-sdk-core/dist/cjs/SDK' {
  // tslint:disable-next-line no-shadowed-variable
  interface SDK {
    getEvent: typeof getEvent
  }
}
