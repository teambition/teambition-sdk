import { Observable } from 'rxjs/Observable'
import { SDKFetch, SDKFetchOptions } from '../SDKFetch'
import { SDK } from '../SDK'
import { Page } from '../Net'

export function request<T, K = T>(
  this: SDKFetch,
  state: Page.State<K>,
  options: SDKFetchOptions & {
    pageSize?: number
    urlQuery?: {}
    mapFn?: (value: T, index?: number, array?: T[], headers?: any) => K
    includeHeaders?: true
    wrapped?: false
  } = {}
): Observable<Page.OriginalResponse<K>> {
  const { pageSize, urlQuery, mapFn, ...requestOptions } = options
  const stateUrlQuery = state.urlQuery || {}
  const paginationUrlQuery = {
    ...(urlQuery ? { ...stateUrlQuery, ...urlQuery } : stateUrlQuery),
    pageSize: pageSize || state.pageSize || 50,
    pageToken: state.nextPageToken
  }

  return this
    .get<Page.OriginalResponse<T>>(state.urlPath, paginationUrlQuery, {
      ...requestOptions, wrapped: false, includeHeaders: true
    })
    .map(({ headers, body: { nextPageToken, totalSize, result } }) => {
      return {
        nextPageToken,
        totalSize,
        result: !options.mapFn
            ? result as any as K[]
            : result.map((x, i, arr) => options.mapFn!(x, i, arr, headers)),
      }
    })
}

// todo(dingwen): remove it
export function next<T, K = T>(
  this: SDKFetch,
  state: Page.State<K>,
  options: {
    pageSize?: number
    urlQuery?: {}
    mapFn?: (value: T, index?: number, array?: T[], headers?: any) => K
  } = {}
): Observable<Page.State<K>> {
  const pageSize = options.pageSize || state.pageSize || 50
  const stateUrlQuery = state.urlQuery || {}
  const urlQuery = options.urlQuery ? { ...stateUrlQuery, ...options.urlQuery } : stateUrlQuery
  const paginationUrlQuery = { ...urlQuery, pageSize, pageToken: state.nextPageToken }
  if (!state.hasMore) { // 只有在 hasMore 为 false 时停住，nextPage 的值才能保持准确
    return Observable.of(state)
  }
  return this
    .get<Page.OriginalResponse<T>>(state.urlPath, paginationUrlQuery, {
      includeHeaders: true
    })
    .map(({ headers, body: { nextPageToken, totalSize, result } }) => {
      const nextState: Page.DynamicState<K> = {
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

SDKFetch.prototype.nextPage = next
SDKFetch.prototype.page = request

declare module '../SDKFetch' {
  // tslint:disable no-shadowed-variable
  interface SDKFetch {
    nextPage: typeof next // todo(dingwen): remove it completely
    page: typeof request
  }
}

export function sdkNext<T>(this: SDK, state: Page.StateUseCache<T>): Observable<Page.StateUseCache<T>> {
  const fetch$ = this.fetch.nextPage(state).publishReplay(1).refCount()
  const resultChanges$ = this.lift<T>({
    tableName: state.tableName,
    cacheValidate: state.cacheValidate as any,
    request: fetch$.map((r) => r.result),
    query: {
      ...state.query,
      limit: state.pageSize * state.nextPage,
      orderBy: [{ fieldName: 'updated', orderBy: 'DESC' }]
    }
  }).changes()

  return resultChanges$.withLatestFrom(fetch$)
    .map(([result, fetchState]) => ({ ...state, ...fetchState, result }))
}

SDK.prototype.nextPage = sdkNext

declare module '../SDK' {
  // tslint:disable no-shadowed-variable
  interface SDK {
    nextPage: typeof sdkNext
  }
}
