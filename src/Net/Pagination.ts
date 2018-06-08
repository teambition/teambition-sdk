import 'rxjs/add/operator/withLatestFrom'
import { Observable } from 'rxjs/Observable'
import { Observer } from 'rxjs/Observer'
import { OperatorFunction } from 'rxjs/interfaces'
import { SDKFetch, SDKFetchOptions } from '../SDKFetch'
import { SDK } from '../SDK'
import { CacheStrategy, ApiResult } from './Net'

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

export type OriginalResponse<T> = {
  nextPageToken: PageToken
  result: T[]
  totalSize?: number
}

export function request<T, K = T>(
  this: SDKFetch,
  state: State<K>,
  options: SDKFetchOptions & {
    pageSize?: number
    urlQuery?: {}
    mapFn?: (value: T, index?: number, array?: T[], headers?: any) => K
    includeHeaders?: true
    wrapped?: false
  } = {}
): Observable<OriginalResponse<K>> {
  const { pageSize, urlQuery, mapFn, ...requestOptions } = options
  const stateUrlQuery = state.urlQuery || {}
  const paginationUrlQuery = {
    ...(urlQuery ? { ...stateUrlQuery, ...urlQuery } : stateUrlQuery),
    pageSize: pageSize || state.pageSize || 50,
    pageToken: state.nextPageToken
  }

  return this
    .get<OriginalResponse<T>>(state.urlPath, paginationUrlQuery, {
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
  if (!state.hasMore) { // 只有在 hasMore 为 false 时停住，nextPage 的值才能保持准确
    return Observable.of(state)
  }
  return this
    .get<OriginalResponse<T>>(state.urlPath, paginationUrlQuery, {
      includeHeaders: true
    })
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
SDKFetch.prototype.page = request

declare module '../SDKFetch' {
  // tslint:disable no-shadowed-variable
  interface SDKFetch {
    nextPage: typeof next // todo(dingwen): remove it completely
    page: typeof request
  }
}

export type SDKState<T> = Pick<ApiResult<T, CacheStrategy>, 'query' | 'tableName' | 'cacheValidate' | 'assocFields' | 'excludeFields'>

export type StateUseCache<T = { updated: string }> = State<T> & SDKState<T> & {
  pageSize: number
}

export function defaultSDKState<T>(
  fetchState: State<T>,
  sdkState: SDKState<T>
): StateUseCache<T> {
  return { ...fetchState, ...sdkState, pageSize: fetchState.pageSize || 50 }
}

export function sdkNext<T>(this: SDK, state: StateUseCache<T>): Observable<StateUseCache<T>> {
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

export const expandResult = <T>(state: State<T>, resp: OriginalResponse<T>): State<T> => {
  return {
    ...state,
    totalSize: resp.totalSize,
    nextPageToken: resp.nextPageToken,
    result: state.result.concat(resp.result),
    nextPage: state.nextPage + 1,
    hasMore: Boolean(resp.nextPageToken) && resp.result.length === state.pageSize
  }
}

export const loadAndExpand = <T>(
  step: (curr: State<T>) => Observable<OriginalResponse<T>>,
  initState: State<T>,
  loadMore$: Observable<{}>
): Observable<State<T>> => {
  return loadMore$.startWith({})
    .pipe(expand(step, initState))
    .mergeAll()
}

export const expand = <T>(
  step: (curr: State<T>) => Observable<OriginalResponse<T>>,
  initState: State<T>
): OperatorFunction<{}, Observable<State<T>>> => (
  source$
) => {
  const state = { ...initState }
  let isLoading = false

  return Observable.create((observer: Observer<Observable<State<T>>>) => {
    const subs = source$.subscribe({
      next: (_) => {
        console.info('next...', { hasMore: state.hasMore, isLoading })
        if (!state.hasMore) {
          observer.complete()
          return
        }
        if (!isLoading) {
          isLoading = true
          observer.next(step(state)
            .map((stepResult) => expandResult(state, stepResult))
            .do((expanded) => Object.assign(state, expanded))
            .catch((err) => Observable.throw(err))
            .finally(() => { console.info('isLoading -> false'); isLoading = false })
          )
        }
      },
      error: (err) => {
        isLoading = false
        observer.error(err)
      }
      // todo(dingwen): 确认是否需要写 complete
    })

    return () => {
      subs.unsubscribe()
    }
  }) as Observable<Observable<State<T>>>
}
