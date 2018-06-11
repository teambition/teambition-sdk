import { Observable } from 'rxjs/Observable'
import { SDKFetch } from '../SDKFetch'

export type PageToken = string & { kind: 'PageToken' }

export const emptyPageToken = '' as PageToken

export interface State<T = {}> {
  paginationUrlPath: string,
  paginationNextPageToken: PageToken
  paginationTotalSize?: number
  paginationResult: T[]

  paginationNextPage: number
  paginationHasMore: boolean

  paginationPageSize?: number
  paginationUrlQuery?: {}
}

export type NestedState<T, K extends string, S extends State<T> = State<T>> = {
  [key in K]: S
}

export function defaultState<T>(
  urlPath: string,
  options: { pageSize?: number, urlQuery?: {} } = {}
): State<T> {
  const raw = {
    paginationUrlPath: urlPath,
    paginationNextPageToken: emptyPageToken,
    paginationTotalSize: 0,
    paginationResult: [],

    paginationNextPage: 1,
    paginationHasMore: true
  }
  if (options.pageSize) {
    Object.assign(raw, { paginationPageSize: options.pageSize })
  }
  if (options.urlQuery) {
    Object.assign(raw, { paginationUrlQuery: options.urlQuery })
  }
  return raw
}

export function getState<T>(local: State<T>): State<T> {
  const raw =  {
    paginationUrlPath: local.paginationUrlPath,
    paginationNextPageToken: local.paginationNextPageToken,
    paginationTotalSize: local.paginationTotalSize,
    paginationResult: local.paginationResult,

    paginationNextPage: local.paginationNextPage,
    paginationHasMore: local.paginationHasMore
  }
  if (local.paginationPageSize) {
    Object.assign(raw, { paginationPageSize: local.paginationPageSize })
  }
  if (local.paginationUrlQuery) {
    Object.assign(raw, { paginationUrlQuery: local.paginationUrlQuery })
  }
  return raw
}

export type OriginalResponse<T> = {
  nextPageToken: PageToken,
  result: T[],
  totalSize?: number
}

export function nextPage<T, K = T>(
  sdkFetch: SDKFetch,
  state: State<K>,
  options: {
    pageSize?: number,
    urlQuery?: {},
    mapFn?: (value: T, index?: number, array?: T[], headers?: any) => K
  } = {}
): Observable<State<K>> {
  const pageSize = options.pageSize || state.paginationPageSize || 50
  const stateUrlQuery = state.paginationUrlQuery || {}
  const urlQuery = options.urlQuery ? { ...stateUrlQuery, ...options.urlQuery } : stateUrlQuery
  const paginationUrlQuery = { ...urlQuery, pageSize, pageToken: state.paginationNextPageToken }
  return sdkFetch
    .get<OriginalResponse<T>>(state.paginationUrlPath, paginationUrlQuery, { includeHeaders: true })
    .map(({ headers, body: { nextPageToken, totalSize, result } }) => {
      return {
        ...state,
        paginationNextPageToken: nextPageToken,
        paginationTotalSize: totalSize,
        paginationResult: state.paginationResult.concat(
          !options.mapFn
            ? result as any as K[]
            : result.map((x, i, arr) => options.mapFn!(x, i, arr, headers))
        ),
        paginationNextPage: state.paginationNextPage + 1,
        paginationHasMore: Boolean(nextPageToken)
      }
    })
}

// todo(dingwen): reset()
