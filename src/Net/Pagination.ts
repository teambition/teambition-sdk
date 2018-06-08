import 'rxjs/add/operator/startWith'
import 'rxjs/add/operator/withLatestFrom'
import { Observable } from 'rxjs/Observable'
import { Observer } from 'rxjs/Observer'
import { OperatorFunction } from 'rxjs/interfaces'
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
