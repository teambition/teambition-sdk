import { Observable } from 'rxjs/Observable'
import { SDKFetch, SDKFetchOptions } from '../SDKFetch'
import { Page } from '../Net'

export type MapFunc<T, K = T> = (value: T, index: number, array: T[], headers: Headers) => K

export function page<T, K = T>(
  this: SDKFetch,
  state: Page.State<K>,
  options: SDKFetchOptions & {
    pageSize?: number
    urlQuery?: {}
    mapFn?: MapFunc<T, K>
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
  state: Page.State<K>,
  options: SDKFetchOptions & {
    pageSize?: number
    urlQuery?: {}
    mapFn?: MapFunc<T, K>
    includeHeaders?: true
    wrapped?: false
    mutate?: boolean
    loadMore$?: Observable<{}>
  } = {}
): Observable<Page.State<K>> {
  const { mutate, loadMore$, ...requestOptions } = options
  const page$ = Page.loadAndExpand((s) => this.page(s, requestOptions), state, loadMore$)
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
