import 'rxjs/add/observable/defer'
import 'rxjs/add/observable/throw'
import 'rxjs/add/operator/catch'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/shareReplay'
import 'rxjs/add/operator/finally'
import { Observable } from 'rxjs/Observable'
import { FetchClient, FetchClientErrorMessage, FetchClientResponseWithHeaders } from './Net/FetchClient'
import { getHttpWithResponseHeaders, Http } from './Net/Http'
import { UserMe } from './schemas/UserMe'
import { forEach, uuid } from './utils'
import { SDKLogger } from './utils/Logger'

export type SDKFetchOptions = {
  apiHost?: string
  token?: string
  headers?: {
    [header: string]: any
    /**
     * 指定 headers 字段的数据是否以 merge 模式设置到
     * 最终要生成的 headers 上。若为 true，使用 merge
     * 模式，将 headers 字段的键值对以类似于 Object.assign
     * 的方式“添加”到 SDKFetch 对象当前的 headers 上；
     * 若为 false，使用 headers 字段替代 SDKFetch 对象
     * 当前的 headers 作为请求使用的 headers。
     * 默认为 false。
     */
    merge?: boolean
  },
  disableRequestId?: boolean
  [fetchOption: string]: any

  /**
   * 当需要使用某些高级功能（如不能通过 Observable 实现的中间件），
   * 设置为 true，会令 get/post/put/delete 请求返回 SDK Http
   * 对象，提供额外功能。默认为 false。
   */
  wrapped?: boolean
  /**
   * 当设置为 true，get/post/put/delete 返回的值中会包含
   * response headers。默认为 false，仅返回 response body。
   */
  includeHeaders?: boolean
}

export namespace HttpHeaders {

  export enum Key { RequestId = 'x-request-id' }

  export function create(headers: {}, options: {
    customHeaders?: {},
    disableRequestId?: boolean
  } = {}): Record<string, string> {
    const hdrs = options.disableRequestId ? {} : {
      [Key.RequestId]: uuid()
    } as Record<string, string>

    (new Headers(headers)).forEach((val: string, key: string) => {
      hdrs[key] = val
    })
    if (options.customHeaders) {
      (new Headers(options.customHeaders)).forEach((val: string, key: string) => {
        hdrs[key] = val
      })
    }
    return hdrs
  }

}

const getUnnamedOptions = (options: SDKFetchOptions) => {
  const {
    apiHost, token, headers, wrapped, includeHeaders, disableRequestId,
    ...unnamed
  } = options
  return unnamed
}

export const defaultSDKFetchHeaders = () => ({
  'accept': 'application/json',
  'content-type': 'application/json',
  'x-timezone': String(- new Date().getTimezoneOffset() / 60)
})

export class SDKFetch {

  constructor(
    private apiHost: string = 'https://www.teambition.com/api',
    private token: string = '',
    private headers: {} = defaultSDKFetchHeaders(),
    private options: {} = {},
    private FetchClientClass: typeof FetchClient = Http
  ) {}

  static FetchStack = new Map<string, Observable<any>>()
  static fetchTail: string | undefined | 0

  get<T>(path: string, query: any, options: SDKFetchOptions & {
    wrapped: true, includeHeaders: true
  }): FetchClient<FetchClientResponseWithHeaders<T>>

  get<T>(path: string, query: any, options: SDKFetchOptions & {
    wrapped: true
  }): FetchClient<T>

  get<T>(path: string, query: any, options: SDKFetchOptions & {
    includeHeaders: true
  }): Observable<FetchClientResponseWithHeaders<T>>

  get<T>(path: string, query?: any, options?: SDKFetchOptions): Observable<T>

  get<T>(path: string, query?: any, options: SDKFetchOptions = {}) {
    const url = this.urlWithPath(path, options.apiHost)
    const urlWithQuery = appendQueryString(url, toQueryString(query))
    const http = options.includeHeaders ? getHttpWithResponseHeaders<T>() : new this.FetchClientClass<T>()
    let dist: Observable<T> | Observable<FetchClientResponseWithHeaders<T>>

    this.setOptionsPerRequest(http, options)

    if (!SDKFetch.FetchStack.has(urlWithQuery)) {
      const tail = SDKFetch.fetchTail || Date.now()
      const urlWithTail = appendQueryString(urlWithQuery, `_=${ tail }`)
      dist = Observable.defer(() => http.setUrl(urlWithTail).get()['request'])
        .shareReplay<any>(1)
        .finally(() => {
          SDKFetch.FetchStack.delete(urlWithQuery)
        })

      SDKFetch.FetchStack.set(urlWithQuery, dist)
    }

    dist = SDKFetch.FetchStack.get(urlWithQuery)!

    http['request'] = dist
    return options.wrapped ? http : http.send()
  }

  private urlWithPath(path: string, apiHost?: string): string {
    const host = apiHost || this.apiHost
    return `${host}/${path}`
  }

  post<T>(path: string, body: any, options: SDKFetchOptions & {
    wrapped: true, includeHeaders: true
  }): FetchClient<FetchClientResponseWithHeaders<T>>

  post<T>(path: string, body: any, options: SDKFetchOptions & {
    wrapped: true
  }): FetchClient<T>

  post<T>(path: string, body: any, options: SDKFetchOptions & {
    includeHeaders: true
  }): Observable<FetchClientResponseWithHeaders<T>>

  post<T>(path: string, body?: any, options?: SDKFetchOptions): Observable<T>

  post<T>(path: string, body?: any, options: SDKFetchOptions = {}) {
    const http = options.includeHeaders ? getHttpWithResponseHeaders<T>() : new this.FetchClientClass<T>()
    const url = this.urlWithPath(path, options.apiHost)

    this.setOptionsPerRequest(http, options)

    http.setUrl(url).post(body)

    return options.wrapped ? http : http.send()
  }

  put<T>(path: string, body: any, options: SDKFetchOptions & {
    wrapped: true, includeHeaders: true
  }): FetchClient<FetchClientResponseWithHeaders<T>>

  put<T>(path: string, body: any, options: SDKFetchOptions & {
    wrapped: true
  }): FetchClient<T>

  put<T>(path: string, body: any, options: SDKFetchOptions & {
    includeHeaders: true
  }): Observable<FetchClientResponseWithHeaders<T>>

  put<T>(path: string, body?: any, options?: SDKFetchOptions): Observable<T>

  put<T>(path: string, body?: any, options: SDKFetchOptions = {}) {
    const http = options.includeHeaders ? getHttpWithResponseHeaders<T>() : new this.FetchClientClass<T>()
    const url = this.urlWithPath(path, options.apiHost)

    this.setOptionsPerRequest(http, options)

    http.setUrl(url).put(body)

    return options.wrapped ? http : http.send()
  }

  delete<T>(path: string, body: any, options: SDKFetchOptions & {
    wrapped: true, includeHeaders: true
  }): FetchClient<FetchClientResponseWithHeaders<T>>

  delete<T>(path: string, body: any, options: SDKFetchOptions & {
    wrapped: true
  }): FetchClient<T>

  delete<T>(path: string, body: any, options: SDKFetchOptions & {
    includeHeaders: true
  }): Observable<FetchClientResponseWithHeaders<T>>

  delete<T>(path: string, body?: any, options?: SDKFetchOptions): Observable<T>

  delete<T>(path: string, body?: any, options: SDKFetchOptions = {}) {
    const http = options.includeHeaders ? getHttpWithResponseHeaders<T>() : new this.FetchClientClass<T>()
    const url = this.urlWithPath(path, options.apiHost)

    this.setOptionsPerRequest(http, options)

    http.setUrl(url).delete(body)

    return options.wrapped ? http : http.send()
  }

  setAPIHost(host: string) {
    this.apiHost = host
    return this
  }

  getAPIHost() {
    return this.apiHost
  }

  setHeaders(headers: {}, merge: boolean = false) {
    this.headers = merge ? Object.assign(this.headers, headers) : headers
    return this
  }

  getHeaders() {
    return { ...this.headers }
  }

  setToken(token: string) {
    this.token = token
    return this
  }

  getToken() {
    return this.token
  }

  setOptions(options: {}) {
    this.options = options
    return this
  }

  getOptions() {
    return { ...this.options }
  }

  setFetchClientClass(FetchClientClass: typeof FetchClient) {
    this.FetchClientClass = FetchClientClass
    return this
  }

  getFetchClientClass() {
    return this.FetchClientClass
  }

  private setOptionsPerRequest(
    client: FetchClient<any>,
    fetchOptions: SDKFetchOptions
  ): void {
    const { disableRequestId } = fetchOptions
    const headerOptions = fetchOptions.headers || { merge: true }
    const { merge, ...customHeaders } = headerOptions
    const headers = merge
      ? HttpHeaders.create(this.headers, { customHeaders: customHeaders, disableRequestId })
      : HttpHeaders.create(customHeaders, { disableRequestId })
    client.setHeaders(headers)

    const token = fetchOptions.token || this.token
    if (token) {
      client.setToken(token)
    }

    let options = getUnnamedOptions(fetchOptions)
    if (Object.keys(options).length === 0) {
      options = this.options
    }
    if (Object.keys(options).length > 0) {
      client.setOpts(options)
    }

    // todo(dingwen): 待实现更有效的 HTTP interceptor，替换这里的实现。
    client['mapFn'] = ((source) => {
      return source.catch((error: FetchClientErrorMessage) => {
        if (!fetchOptions.disableRequestId) {
          error['requestId'] = headers[HttpHeaders.Key.RequestId]
        }
        return Observable.throw(error)
      })
    })
  }

  // 注意：当该方法相关逻辑发生修改，请至 mock/mock.ts 做相应修改。
  static buildQuery(url: string, query: any) {
    return appendQueryString(url, toQueryString(query))
  }

  getUserMe() {
    return this.get<UserMe>('users/me')
  }
}

const appendQueryString = (url: string, queryString: string) => {
  if (!queryString) {
    return url
  }
  if (url.slice(-1) === '?') { // '?' 是最后一个字符
    return `${url}${queryString}`
  }
  return url.indexOf('?') === -1
    ? `${url}?${queryString}`  // '?' 不存在
    : `${url}&${queryString}`  // '?' 存在，其后还有其他字符
}

const toQueryString = (query: any) => {
  if (typeof query !== 'object' || !query) {
    return ''
  }
  const result: string[] = []
  forEach(query, (val: any, key: string) => {
    if (key === '_') {
      SDKLogger.warn('query should not contain key \'_\', it will be ignored')
    } else if (Array.isArray(val)) {
      val.forEach(_val => {
        result.push(`${key}=${encoded(_val)}`)
      })
    } else if (typeof val !== 'undefined') {
      result.push(`${key}=${encoded(val)}`)
    }
  })
  return result.join('&')
}

/**
 * encodeURIComponent 不会修改的字符有 A-Z a-z 0-9 - _ . ! ~ * ' ( )
 * - 参考自 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent#Description
 * 而被修改的字符，都会以 percent-encoding 方法替换
 * - 参考自 https://tools.ietf.org/html/rfc3986#section-2.4
 * - percent-encoding 的方法参考自 https://tools.ietf.org/html/rfc3986#section-2.1
 */
const encodedRegExp = /^(%(\d|[a-fA-F]){2}|[a-zA-Z0-9]|-|_|\.|!|~|\*|'|\(|\))*$/
//                       ^percent-encoded^ ^^^^^^^^^^^^^escaped^^^^^^^^^^^^^w

const encoded = (value: {} | null): string => {
  const maybeEncoded = String(value)
  return encodedRegExp.test(maybeEncoded)
    ? maybeEncoded
    : encodeURIComponent(maybeEncoded)
}
