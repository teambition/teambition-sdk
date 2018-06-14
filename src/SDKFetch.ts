import 'rxjs/add/observable/defer'
import 'rxjs/add/operator/catch'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/publishReplay'
import 'rxjs/add/operator/finally'
import { Observable } from 'rxjs/Observable'
import { Http, HttpResponseWithHeaders, getHttpWithResponseHeaders } from './Net/Http'
import { UserMe } from './schemas/UserMe'
import { forEach, isEmptyObject } from './utils'
import { SDKLogger } from './utils/Logger'

export type SDKFetchOptions = {
  apiHost?: string,
  token?: string,
  headers?: {
    [header: string]: any,
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
  [fetchOption: string]: any,

  /**
   * 当需要使用某些高级功能（如不能通过 Observable 实现的中间件），
   * 设置为 true，会令 get/post/put/delete 请求返回 SDK Http
   * 对象，提供额外功能。默认为 false。
   */
  wrapped?: boolean,
  /**
   * 当设置为 true，get/post/put/delete 返回的值中会包含
   * response headers。默认为 false，仅返回 response body。
   */
  includeHeaders?: boolean,
}

const getUnnamedOptions = (options: SDKFetchOptions): {} => {
  const {
    apiHost, token, headers, wrapped, includeHeaders,
    ...unnamed
  } = options
  return unnamed
}

export const defaultSDKFetchHeaders = () => ({
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  'x-timezone': - new Date().getTimezoneOffset() / 60
})

export const SIMPLE_READ_REQUEST = 'SYMBOL_GET'

export class SDKFetch {

  constructor(
    private apiHost: string = 'https://www.teambition.com/api',
    private token: string = '',
    private headers: {} = defaultSDKFetchHeaders(),
    private options: {} = {}
  ) {}

  static FetchStack = new Map<string, Observable<any>>()
  static fetchTail: string | undefined | 0
  static MemorizedFetch = new Map<string, any>()

  memorized<T>(request: Observable<T>) {
    if (!request[SIMPLE_READ_REQUEST]) {
      SDKLogger.warn('Only Raw GET request can be memorized.')
      return request
    }

    if (SDKFetch.MemorizedFetch.has(request[SIMPLE_READ_REQUEST])) {
      return request
    }

    const alternate = request.do((ret) => {
      SDKFetch.MemorizedFetch.set(request[SIMPLE_READ_REQUEST], ret)
    })

    return alternate
  }

  clearMemory() {
    SDKFetch.MemorizedFetch.clear()
  }

  get<T>(path: string, query: any, options: SDKFetchOptions & {
    wrapped: true, includeHeaders: true
  }): Http<HttpResponseWithHeaders<T>>

  get<T>(path: string, query: any, options: SDKFetchOptions & {
    wrapped: true
  }): Http<T>

  get<T>(path: string, query: any, options: SDKFetchOptions & {
    includeHeaders: true
  }): Observable<HttpResponseWithHeaders<T>>

  get<T>(path: string, query?: any, options?: SDKFetchOptions): Observable<T>

  get<T>(path: string, query?: any, options: SDKFetchOptions = {}) {
    const url = this.urlWithPath(path, options.apiHost)
    const urlWithQuery = query ? SDKFetch.buildQuery(url, query) : url
    const http = options.includeHeaders ? getHttpWithResponseHeaders<T>() : new Http<T>()
    const isSimpleRequest = !options.wrapped && !options.includeHeaders
    let dist: Observable<T> | Observable<HttpResponseWithHeaders<T>>

    this.setOptionsPerRequest(http, options)

    if (isSimpleRequest && SDKFetch.MemorizedFetch.has(urlWithQuery)) {
      dist = Observable.of(SDKFetch.MemorizedFetch.get(urlWithQuery))
    } else {
      if (!SDKFetch.FetchStack.has(urlWithQuery)) {
        const tail = SDKFetch.fetchTail || Date.now()
        const urlWithTail = query && !isEmptyObject(query)
          ? `${ urlWithQuery }&_=${ tail }`
          : `${ urlWithQuery }?_=${ tail }`
        dist = Observable.defer(() =>
          http.setUrl(urlWithTail).get()
            .send()
            .publishReplay<any>(1)
            .refCount()
        )
        .finally(() => {
          SDKFetch.FetchStack.delete(urlWithQuery)
        })

        SDKFetch.FetchStack.set(urlWithQuery, dist)
      }
    }

    dist = SDKFetch.FetchStack.get(urlWithQuery)!
    if (isSimpleRequest) {
      dist[SIMPLE_READ_REQUEST] = urlWithQuery
    }

    if (options.wrapped) {
      http['request'] = dist
      return http
    } else {
      return dist
    }
  }

  private urlWithPath(path: string, apiHost?: string): string {
    const host = apiHost || this.apiHost
    return `${host}/${path}`
  }

  post<T>(path: string, body: any, options: SDKFetchOptions & {
    wrapped: true, includeHeaders: true
  }): Http<HttpResponseWithHeaders<T>>

  post<T>(path: string, body: any, options: SDKFetchOptions & {
    wrapped: true
  }): Http<T>

  post<T>(path: string, body: any, options: SDKFetchOptions & {
    includeHeaders: true
  }): Observable<HttpResponseWithHeaders<T>>

  post<T>(path: string, body?: any, options?: SDKFetchOptions): Observable<T>

  post<T>(path: string, body?: any, options: SDKFetchOptions = {}) {
    const http = options.includeHeaders ? getHttpWithResponseHeaders<T>() : new Http<T>()
    const url = this.urlWithPath(path, options.apiHost)

    this.setOptionsPerRequest(http, options)

    http.setUrl(url).post(body)

    return options.wrapped ? http : http['request']
  }

  put<T>(path: string, body: any, options: SDKFetchOptions & {
    wrapped: true, includeHeaders: true
  }): Http<HttpResponseWithHeaders<T>>

  put<T>(path: string, body: any, options: SDKFetchOptions & {
    wrapped: true
  }): Http<T>

  put<T>(path: string, body: any, options: SDKFetchOptions & {
    includeHeaders: true
  }): Observable<HttpResponseWithHeaders<T>>

  put<T>(path: string, body?: any, options?: SDKFetchOptions): Observable<T>

  put<T>(path: string, body?: any, options: SDKFetchOptions = {}) {
    const http = options.includeHeaders ? getHttpWithResponseHeaders<T>() : new Http<T>()
    const url = this.urlWithPath(path, options.apiHost)

    this.setOptionsPerRequest(http, options)

    http.setUrl(url).put(body)

    return options.wrapped ? http : http['request']
  }

  delete<T>(path: string, body: any, options: SDKFetchOptions & {
    wrapped: true, includeHeaders: true
  }): Http<HttpResponseWithHeaders<T>>

  delete<T>(path: string, body: any, options: SDKFetchOptions & {
    wrapped: true
  }): Http<T>

  delete<T>(path: string, body: any, options: SDKFetchOptions & {
    includeHeaders: true
  }): Observable<HttpResponseWithHeaders<T>>

  delete<T>(path: string, body?: any, options?: SDKFetchOptions): Observable<T>

  delete<T>(path: string, body?: any, options: SDKFetchOptions = {}) {
    const http = options.includeHeaders ? getHttpWithResponseHeaders<T>() : new Http<T>()
    const url = this.urlWithPath(path, options.apiHost)

    this.setOptionsPerRequest(http, options)

    http.setUrl(url).delete(body)

    return options.wrapped ? http : http['request']
  }

  setAPIHost(host: string) {
    this.apiHost = host
    return this
  }

  getAPIHost() {
    return this.apiHost
  }

  setHeaders(headers: {}) {
    this.headers = headers
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

  private setOptionsPerRequest(
    http: Http<any>,
    fetchOptions: SDKFetchOptions
  ): void {
    let headers: any

    if (fetchOptions.headers) {
      const { merge, ...hdrs } = fetchOptions.headers

      headers = merge ? { ...this.headers, ...hdrs } : hdrs
    } else {
      headers = this.headers
    }

    const token = fetchOptions.token || this.token

    let options = getUnnamedOptions(fetchOptions)
    if (Object.keys(options).length === 0) {
      options = this.options
    }

    http.setHeaders(headers)
    if (token) {
      http.setToken(token)
    }

    if (Object.keys(options).length > 0) {
      http.setOpts(options)
    }
  }

  // 注意：当该方法相关逻辑发生修改，请至 mock/mock.ts 做相应修改。
  static buildQuery(url: string, query: any) {
    if (typeof query !== 'object' || !query) {
      return url
    }
    const result: string[] = []
    const pushKVToResult = pushKVEncoded(result)
    forEach(query, (val: any, key: string) => {
      if (key === '_') {
        SDKLogger.warn('query should not contain key \'_\', it will be ignored')
        return
      }
      if (Array.isArray(val)) {
        val.forEach(_val => pushKVToResult(key, _val))
        return
      }
      pushKVToResult(key, val)
    })
    let _query: string
    if (url.indexOf('?') !== -1) {
      const hasExistingQueryInUrl = url.slice(-1) !== '?'
      const additionalQuery = result.join('&')
      _query = hasExistingQueryInUrl && additionalQuery
        ? '&' + additionalQuery
        : additionalQuery
    } else {
      _query = result.length ? '?' + result.join('&') : ''
    }
    return url + _query
  }

  getUserMe() {
    return this.get<UserMe>('users/me')
  }
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

const pushKVEncoded = (array: string[]) => (key: string, value: any): void => {
  if (typeof value === 'undefined') {
    return
  }

  const maybeEncoded = String(value)
  const encoded = encodedRegExp.test(maybeEncoded)
    ? maybeEncoded
    : encodeURIComponent(maybeEncoded)

  array.push(`${key}=${encoded}`)
}
