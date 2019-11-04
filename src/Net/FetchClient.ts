import 'rxjs/add/observable/throw'
import 'rxjs/add/observable/dom/ajax'
import 'rxjs/add/observable/empty'
import 'rxjs/add/operator/catch'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/publishReplay'
import { AjaxError } from 'rxjs/observable/dom/AjaxObservable'
import { Observable } from 'rxjs/Observable'
import { Observer } from 'rxjs/Observer'
import { Subject } from 'rxjs/Subject'
import { testable } from '../testable'
import { forEach, isNonNullable, parseHeaders } from '../utils'

export type AllowedFetchMethod = 'get' | 'post' | 'put' | 'delete'

export interface FetchClientErrorMessage {
  method: AllowedFetchMethod
  url: string
  error: Response
  body?: any
  [userDefinedKey: string]: any
}

export interface FetchClientResponseWithHeaders<T = any> {
  headers: Headers,
  body: T
}

export type MethodParams = {
  url: string,
  body?: any,
  _opts: any,
  includeHeaders: boolean
}

const rxAjaxDefaultHeaderKey2NormKey = {
  'X-Requested-With': 'x-requested-with',
  'Content-Type': 'content-type'
}

/**
 * Observable.ajax 目前的实现，对请求头字段的已有设置检查没有遵循
 * 头字段 key 不区分大小写的原则，比如：如果用户已經设置 `content-type`，
 * Observable.ajax 内部会发现 `Content-Type` 没有设置，结果会
 * 额外添加一个 `Content-Type` 字段，结果导致浏览器发现请求头字段里
 * 既有 `content-type` 又有 `Content-Type`，出现问题。
 */
const coverRxAjaxHeadersBug = (normHeaders: {}) => {
  forEach(rxAjaxDefaultHeaderKey2NormKey, (val, key) => {
    if (isNonNullable(normHeaders[val])) {
      normHeaders[key] = normHeaders[val]
      delete normHeaders[val]
    }
  })
}

/**
 * 检查 respHeaders 里是否有 x-http-status 字段可用，如果有，
 * 优先使用其值作为上层应用需要的 status。
 *
 * 注意：会对传入的 resp 参数有副作用，可能会改变其内的
 * status 字段对应值。
 */
const normResponseStatus = (resp: Response | XMLHttpRequest, respHeaders: Headers) => {
  // respXHR.status 放到 Number 里面
  // 保证当 x-http-status 为 '0'(truthy) 时，表达式结果仍以 x-http-status 为准
  const realStatusCode = Number(respHeaders.get('x-http-status') || resp.status)
  if (realStatusCode >= 400 && realStatusCode !== resp.status) {
    // 因为标准中 XHR 对象的 status 值是只读的，
    // 这里使用 Object.defineProperty 来强制修改 status 为实际值。
    Object.defineProperty(resp, 'status', { value: realStatusCode })
  }
}

export const FetchError$ = new Subject<FetchClientErrorMessage>() as any as Observable<FetchClientErrorMessage>

export const createMethod = (method: AllowedFetchMethod) => (params: MethodParams): Observable<any> => {
  const { url, body, _opts, includeHeaders } = params

  /* istanbul ignore if */
  if (testable.UseXMLHTTPRequest && typeof window !== 'undefined') {
    coverRxAjaxHeadersBug(_opts.headers)
    return Observable.ajax({
      url, body, method,
      headers: _opts.headers,
      withCredentials: _opts.credentials === 'include',
      responseType: _opts.responseType || 'json',
      crossDomain: typeof _opts.crossDomain !== 'undefined' ? !!_opts.crossDomain : true
    })
      .map(value => {
        const respBody = value.response
        const respXHR = value.xhr
        const respHeaders = parseHeaders(respXHR.getAllResponseHeaders())
        normResponseStatus(respXHR, respHeaders) // note: 对 respXHR 有副作用
        if (respXHR.status >= 400) {
          throw new AjaxError(
            `ajax error ${ respXHR.status }`,
            respXHR,
            value.request
          )
        }
        if (!includeHeaders) {
          return respBody
        }
        return { headers: respHeaders, body: respBody }
      })
      .catch((e: AjaxError) => {
        const headers = e.xhr.getAllResponseHeaders()
        // 不使用原生 xhr 上的 response（`e.xhr.response`），避免 IE 上的兼容性问题
        // （IE 11 上不会自动将 responseType 为 json 的 response 解析为对象，而是
        // 返回字符串）。详见：https://github.com/ReactiveX/rxjs/issues/1381
        const response = e.response
        const errorResponse = new Response(new Blob([JSON.stringify(response)]), {
          status: e.xhr.status,
          statusText: e.xhr.statusText,
          headers: headers.length ? parseHeaders(headers) : new Headers()
        })
        return Observable.throw({ method, url, body, error: errorResponse })
      })
  } else { // 测试用分支
    return Observable.create((observer: Observer<any>) => {
      const _options = {
        ... _opts,
        method: method
      }
      if (body) { // body 内容没有 stringify，以便于测试代码中（如：mockFetch）的数据处理
        _options.body = body
      }
      let headers: Headers
      fetch(url, _options)
        .then((response: Response): Promise<string> => {
          normResponseStatus(response, response.headers) // note: 对 response 有副作用
          if (response.status >= 200 && response.status < 400) {
            headers = response.headers
            return response.text()
          } else {
            throw response
          }
        })
        .then(respText => {
          let result: any
          try {
            const respBody = JSON.parse(respText)
            result = !includeHeaders ? respBody : { headers, body: respBody }
          } catch (e) {
            result = respText
          }
          observer.next(result)
          observer.complete()
        })
        .catch((errorResponse: Response) => {
          observer.error({ method, url, body, error: errorResponse })
        })
    })
  }
}

export class FetchClient<T> {
  private errorAdapter$: Subject<FetchClientErrorMessage>
  private cloned = false
  private request: Observable<T> | undefined
  public mapFn: (v$: Observable<T>) => Observable<any> = (dist$ => dist$)

  protected static get = createMethod('get')
  protected static put = createMethod('put')
  protected static post = createMethod('post')
  protected static delete = createMethod('delete')

  protected client = FetchClient

  private static defaultOpts = () => ({
    headers: {},
    credentials: 'include'
  })

  constructor(
    private url: string = '',
    errorAdapter$?: Subject<FetchClientErrorMessage>,
    private readonly includeHeaders: boolean = false
  ) {
    if (errorAdapter$) {
      this.errorAdapter$ = errorAdapter$
    } else {
      this.errorAdapter$ = FetchError$ as Subject<FetchClientErrorMessage>
    }
  }

  private _opts: any = this.client.defaultOpts()

  // todo(dingwen): 实现更可控、支持多层叠加的 interceptor
  // map<U>(fn: (stream$: Observable<T>) => Observable<U>) {
  //   this.mapFn = fn
  //   return this as any as Http<U>
  // }

  setUrl(url: string) {
    this.url = url
    return this
  }

  setHeaders(headers: any) {
    this._opts.headers = { ...this._opts.headers, ...headers }
    return this
  }

  setToken(token: string) {
    delete this._opts.credentials
    this._opts.headers.Authorization = `OAuth2 ${token}`
    return this
  }

  setOpts(opts: any) {
    this._opts = { ...this._opts, ...opts }
    return this
  }

  restore() {
    this._opts = this.client.defaultOpts()
    return this
  }

  get() {
    this.request = this.client.get(this.params())
    return this
  }

  post(body?: any) {
    this.request = this.client.post({ ...this.params(), body })
    return this
  }

  put(body?: any) {
    this.request = this.client.put({ ...this.params(), body })
    return this
  }

  delete(body?: any) {
    this.request = this.client.delete({ ...this.params(), body })
    return this
  }

  send(): Observable<T> {
    if (!this.request) {
      return Observable.empty<T>()
    }
    const response$ = this.mapFn(this.request)
    return response$
      .catch((msg: FetchClientErrorMessage) => {
        const msgClone = { ...msg, error: msg.error.clone() }
        setTimeout(() => {
          this.errorAdapter$.next(msgClone)
        }, 10)
        return Observable.throw(msg)
      })
  }

  clone() {
    const result = new FetchClient<T>(this.url, this.errorAdapter$)
    if (!this.cloned && this.request) {
      this.request = this.request.publishReplay(1).refCount()
      this.cloned = true
      result.cloned = true
    }
    result.request = this.request
    result.mapFn = this.mapFn
    return result
  }

  private params = (): MethodParams => ({
    url: this.url,
    _opts: this._opts,
    includeHeaders: this.includeHeaders
  })
}
