import { Observable } from 'rxjs/Observable'
import { SDKFetch } from '../SDKFetch'

export type PageToken = string & { kind: 'PageToken' }

export const emptyPageToken = '' as PageToken

export interface State<T = {}> {
  paginationUrlPath: string,
  paginationNextPageToken: PageToken
  paginationTotalSize?: number
  paginationResult: T[]
}

export type NestedState<T, K extends string, S extends State<T> = State<T>> = {
  [key in K]: S
}

export function defaultState<T, K = undefined, E extends { [key: string]: any } = {}>(
  urlPath: string,
  namespace?: keyof K,
  extra?: E
): (K extends undefined ? State<T> : NestedState<T, keyof K, State<T> & E>) {
  const raw = {
    paginationUrlPath: urlPath,
    paginationNextPageToken: emptyPageToken,
    paginationTotalSize: 0,
    paginationResult: []
  }
  return (!namespace ? raw : { [namespace]: Object.assign(raw, extra) }) as any
}

export function getState<T>(local: State<T>): State<T> {
  return {
    paginationUrlPath: local.paginationUrlPath,
    paginationNextPageToken: local.paginationNextPageToken,
    paginationTotalSize: local.paginationTotalSize,
    paginationResult: local.paginationResult
  }
}

export type OriginalResponse<T> = {
  nextPageToken: PageToken,
  result: T[],
  totalSize?: number
}

export function nextPage<T, K = T>(
  sdkFetch: SDKFetch,
  state: State<K>,
  pageSize: number,
  urlQuery: {} = {},
  mapFn?: (value: T, index?: number, array?: T[], headers?: any) => K
): Observable<State<K>> {
  return sdkFetch
    .get<OriginalResponse<T>>(state.paginationUrlPath, {
      ...urlQuery,
      pageSize,
      pageToken: state.paginationNextPageToken
    }, { includeHeaders: true })
    .map(({ headers, body: { nextPageToken, totalSize, result } }) => {
      return {
        ...state,
        paginationNextPageToken: nextPageToken,
        paginationTotalSize: totalSize,
        paginationResult: state.paginationResult.concat(
          !mapFn
            ? result as any as K[]
            : result.map((x, i, arr) => mapFn(x, i, arr, headers))
        )
      }
    })
}

// todo(dingwen): reset()
