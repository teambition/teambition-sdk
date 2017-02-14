import { QueryToken } from 'reactivedb'

export const replaceToken = <T, U>(token: QueryToken<any>, mapFn: (val: T) => U) => {
  const changes = token.changes
  const values = token.values
  const combine = token.combine
  token.changes = () => changes.call(token)
    .map(mapFn)

  token.values = () => values.call(token)
    .map(mapFn)

  token.combine = (...args: QueryToken<IterableIterator<any>>[]) => {
    const combinedToken = combine.apply(token, args)
    replaceToken(combinedToken, mapFn)
    return combinedToken
  }

  return token
}
