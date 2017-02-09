import { QueryToken } from 'reactivedb'
import { EventData } from '../../schemas/Event'

export const isRecurrence = (event: EventData) => event.recurrence && event.recurrence.length
export const replaceToken = <T, U>(token: QueryToken<any>, mapFn: (val: T) => U) => {
  const changes = token.changes
  const values = token.values
  const combine = token.combine
  token.changes = () => changes.call(token)
    .map(mapFn)

  token.values = () => values.call(token)
    .map(mapFn)

  token.combine = (...args: QueryToken<IterableIterator<EventData>>[]) => {
    const combinedToken = combine.apply(token, args)
    replaceToken(combinedToken, mapFn)
    return combinedToken
  }

  return token
}
