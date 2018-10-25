import { Observable } from 'rxjs/Observable'
import { SDKFetch, SDKFetchOptions } from '../SDKFetch'
import { Page } from '../Net'

abstract class PageUtil<T, S extends Page.State<T>> {
  protected readonly state: S

  constructor(state: S) {
    this.state = state
  }

  abstract toUrlQuery(pageSize?: number): {}
  abstract normResponse(body: unknown, headers: Headers, mapFn?: unknown): {}
  abstract acc(resp: unknown): S
}

class KindA<T> extends PageUtil<T, Page.State<T>> {
  toUrlQuery(pageSize?: number) {
    return {
      count: pageSize || this.state.pageSize || 50,
      page: this.state.nextPage
    }
  }

  normResponse<K>(body: T[], headers: Headers, mapFn?: MapFunc<T, K>) {
    return !mapFn
      ? body as any as K[]
      : body.map((x, i, arr) => mapFn(x, i, arr, headers))
  }

  acc(resp: T[]) {
    return {
      ...this.state,
      result: this.state.result.concat(resp),
      nextPage: this.state.nextPage + 1,
      hasMore: resp.length === this.state.pageSize
    }
  }
}

export class KindB<T> extends PageUtil<T, Page.State<T>> {

  static defaultState<T>(
    urlPath: string,
    options: {
      pageSize?: number
      urlQuery?: {}
    } = {}
  ): Page.State<T> {
    const raw: Page.State<T> = {
      urlPath: urlPath,
      nextPageToken: Page.emptyPageToken,
      totalSize: undefined,
      result: [],

      nextPage: 1,
      hasMore: true
    }
    if (options.pageSize) {
      Object.assign(raw, { pageSize: options.pageSize })
    }
    if (options.urlQuery) {
      const { pageSize, ...nonPaginationQuery } = options.urlQuery as any
      Object.assign(raw, { urlQuery: nonPaginationQuery })
      if (!raw.pageSize && pageSize) {
        raw.pageSize = pageSize
      }
    }
    return raw
  }

  toUrlQuery(pageSize?: number) {
    return {
      pageSize: pageSize || this.state.pageSize || 50,
      pageToken: this.state.nextPageToken
    }
  }

  normResponse<K>(body: Page.OriginalResponse<T>, headers: Headers, mapFn?: MapFunc<T, K>) {
    return {
      nextPageToken: body.nextPageToken,
      totalSize: body.totalSize,
      result: !mapFn
        ? body.result as any as K[]
        : body.result.map((x, i, arr) => mapFn(x, i, arr, headers))
    }
  }

  acc(resp: Page.OriginalResponse<T>) {
    return {
      ...this.state,
      totalSize: resp.totalSize,
      nextPageToken: resp.nextPageToken,
      result: this.state.result.concat(resp.result),
      nextPage: this.state.nextPage + 1,
      hasMore: Boolean(resp.nextPageToken) && resp.result.length === this.state.pageSize
    }
  }
}

function factory<T>(state: Page.State<T>): KindB<T> {
  return new KindB(state)
}

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
  const a = factory(state)
  const paginationUrlQuery = {
    ...(urlQuery ? { ...stateUrlQuery, ...urlQuery } : stateUrlQuery),
    ...a.toUrlQuery(pageSize)
    // pageSize: pageSize || state.pageSize || 50,
    // pageToken: state.nextPageToken
  }

  return this
    .get<Page.OriginalResponse<T>>(state.urlPath, paginationUrlQuery, {
      ...requestOptions, wrapped: false, includeHeaders: true
    })
    .map(({ headers, body }) => {
      return a.normResponse<K>(body, headers, options.mapFn)
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
