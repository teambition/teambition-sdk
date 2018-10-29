import { Observable } from 'rxjs/Observable'
import { SDKFetch, SDKFetchOptions } from '../SDKFetch'
import { Page } from '../Net'

export type MapFunc<T, K = T> = (value: T, index: number, array: T[], headers: Headers) => K

export type RequestOptions<T, K> = SDKFetchOptions & {
  pageSize?: number
  urlQuery?: {}
  mapFn?: MapFunc<T, K>
  includeHeaders?: true
  wrapped?: false
}

function toUrlQuery<T>(state: Page.PolyState<T>, perRequestPageSize?: number, perRequestUrlQuery?: {}): {} {
  const urlQuery = { ...state.urlQuery, ...perRequestUrlQuery }

  const pageSize = perRequestPageSize
    || (urlQuery && (urlQuery['pageSize'] || urlQuery['count']))
    || state.pageSize

  switch (state.kind) {
    case Page.Kind.A:
      return {
        ...urlQuery,
        page: state.nextPage,
        count: pageSize
      }
    case Page.Kind.B:
      return {
        ...urlQuery,
        pageSize,
        pageToken: state.nextPageToken
      }
    default:
      return {}
  }
}

export function page<T, K = T>(this: SDKFetch, state: Page.StateA<K>, options?: RequestOptions<T, K>): Observable<K[]>
export function page<T, K = T>(this: SDKFetch, state: Page.StateB<K>, options?: RequestOptions<T, K>): Observable<Page.OriginalResponse<K>>
export function page<T, K = T>(
  this: SDKFetch, state: Page.PolyState<K>, options?: RequestOptions<T, K>
): Observable<K[]> | Observable<Page.OriginalResponse<K>>
export function page<T, K = T>(
  this: SDKFetch,
  state: Page.PolyState<K>,
  options: RequestOptions<T, K> = {}
): Observable<any> {
  const { pageSize, urlQuery, mapFn, ...requestOptions } = options
  const paginationUrlQuery = toUrlQuery(state, pageSize, urlQuery)

  return this
    .get<T[] | Page.OriginalResponse<T>>(state.urlPath, paginationUrlQuery, {
      ...requestOptions, wrapped: false, includeHeaders: true
    })
    .map(({ headers, body }) => {
      switch (state.kind) {
        case Page.Kind.A: {
          const result = body as T[]
          return !options.mapFn
            ? result as any as K[]
            : result.map((x, i, arr) => options.mapFn!(x, i, arr, headers))
        }
        case Page.Kind.B: {
          const resp = body as Page.OriginalResponse<T>
          const result = resp.result
          return {
            nextPageToken: resp.nextPageToken,
            totalSize: resp.totalSize,
            result: !options.mapFn
              ? result as any as K[]
              : result.map((x, i, arr) => options.mapFn!(x, i, arr, headers))
          }
        }
        default:
          return body
      }
    })
}

export type ExpandPageOptions<T, K> = RequestOptions<T, K> & {
  mutate?: boolean
  loadMore$?: Observable<{}>
  doNotConcat?: boolean
}

export function expandPage<T, K = T>(this: SDKFetch, state: Page.StateA<K>, options?: ExpandPageOptions<T, K>): Observable<Page.StateA<K>>
export function expandPage<T, K = T>(this: SDKFetch, state: Page.StateB<K>, options?: ExpandPageOptions<T, K>): Observable<Page.StateB<K>>
export function expandPage<T, K = T>(this: SDKFetch, state: Page.PolyState<K>, options?: ExpandPageOptions<T, K>): Observable<Page.PolyState<K>>
/**
 * 结合当前分页状态，发起下一页请求，获得返回结果，并推出新的分页状态。
 * @param state 当前分页的状态
 * @param options 主要用于自定义每一次调用需要的请求参数。另外，如果
 * `mutate` 为 true，传入的 `state` 对象将自动得到更新，不需要在外部
 * 自行 `.do((nextState) => state = nextState)`（注：推出的对象依然是
 * 全新的）。
 */
export function expandPage<T, K = T>(
  this: SDKFetch,
  state: Page.PolyState<K>,
  options: ExpandPageOptions<T, K> = {}
): Observable<Page.PolyState<K>> {
  const { mutate, loadMore$, doNotConcat, ...requestOptions } = options
  const page$ = (loadMore$ || Observable.empty())
    .startWith({})
    .pipe(Page.expand<K>(
      (s) => this.page(s, requestOptions),
      doNotConcat ? Page.accWithoutConcat : Page.acc,
      state
    ))
    .mergeAll()
  return !mutate ? page$ : page$.do((nextState) => Object.assign(state, nextState))
}

SDKFetch.prototype.expandPage = expandPage
SDKFetch.prototype.page = page

declare module '../SDKFetch' {
  // tslint:disable no-shadowed-variable
  interface SDKFetch {
    expandPage: typeof expandPage
    page: typeof page
  }
}
