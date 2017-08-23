import 'rxjs/add/operator/toArray'
import { QueryToken } from 'reactivedb'
import { SDK, CacheStrategy } from '../../SDK'
import { EventSchema } from '../../schemas/Event'
import { EventGenerator } from './EventGenerator'
import { EventId } from 'teambition-types'

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

declare module '../../SDK' {
  interface SDK { // tslint:disable-line no-shadowed-variable
    getEvent: typeof getEvent
  }
}
