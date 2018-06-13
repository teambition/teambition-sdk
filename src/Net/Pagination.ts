import { Observable } from 'rxjs/Observable'
import { SDKFetch } from '../SDKFetch'

export type PageToken = string & { kind: 'PageToken' }

export const emptyPageToken = '' as PageToken

export interface DynamicState<T = {}> {
  nextPageToken: PageToken
  totalSize?: number
  result: T[]

  nextPage: number
  hasMore: boolean
}

export interface State<T = {}> extends DynamicState<T> {
  urlPath: string

  pageSize?: number
  urlQuery?: {}
}

export type NestedState<T, K extends string, S extends State<T> = State<T>> = {
  [key in K]: S
}

export function defaultState<T>(
  urlPath: string,
  options: {
    pageSize?: number
    urlQuery?: {}
  } = {}
): State<T> {
  const raw = {
    urlPath: urlPath,
    nextPageToken: emptyPageToken,
    totalSize: 0,
    result: [],

    nextPage: 1,
    hasMore: true
  }
  if (options.pageSize) {
    Object.assign(raw, { pageSize: options.pageSize })
  }
  if (options.urlQuery) {
    Object.assign(raw, { urlQuery: options.urlQuery })
  }
  return raw
}

export function getState<T>(local: State<T>): State<T> {
  const raw =  {
    urlPath: local.urlPath,
    nextPageToken: local.nextPageToken,
    totalSize: local.totalSize,
    result: local.result,

    nextPage: local.nextPage,
    hasMore: local.hasMore
  }
  if (local.pageSize) {
    Object.assign(raw, { pageSize: local.pageSize })
  }
  if (local.urlQuery) {
    Object.assign(raw, { urlQuery: local.urlQuery })
  }
  return raw
}

export type OriginalResponse<T> = {
  nextPageToken: PageToken
  result: T[]
  totalSize?: number
}

export function next<T, K = T>(
  this: SDKFetch,
  state: State<K>,
  options: {
    pageSize?: number
    urlQuery?: {}
    mapFn?: (value: T, index?: number, array?: T[], headers?: any) => K
  } = {}
): Observable<State<K>> {
  const pageSize = options.pageSize || state.pageSize || 50
  const stateUrlQuery = state.urlQuery || {}
  const urlQuery = options.urlQuery ? { ...stateUrlQuery, ...options.urlQuery } : stateUrlQuery
  const paginationUrlQuery = { ...urlQuery, pageSize, pageToken: state.nextPageToken }
  return this
    .get<OriginalResponse<T>>(state.urlPath, paginationUrlQuery, { includeHeaders: true })
    .map(({ headers, body: { nextPageToken, totalSize, result } }) => {
      const nextState: DynamicState<K> = {
        nextPageToken: nextPageToken,
        totalSize: totalSize,
        result: state.result.concat(
          !options.mapFn
            ? result as any as K[]
            : result.map((x, i, arr) => options.mapFn!(x, i, arr, headers))
        ),
        nextPage: state.nextPage + 1,
        hasMore: Boolean(nextPageToken) && result.length === pageSize
      }
      return { ...state, ...nextState }
    })
}

// todo(dingwen): reset()

SDKFetch.prototype.nextPage = next

declare module '../SDKFetch' {
  // tslint:disable no-shadowed-variable
  interface SDKFetch {
    nextPage: typeof next
  }
}
