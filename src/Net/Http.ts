import 'rxjs/add/observable/throw'
import 'rxjs/add/observable/dom/ajax'
import 'rxjs/add/observable/empty'
import 'rxjs/add/operator/catch'
import 'rxjs/add/operator/map'
import { AjaxError } from 'rxjs/observable/dom/AjaxObservable'
import { Observable } from 'rxjs/Observable'
import { Observer } from 'rxjs/Observer'
import { Subject } from 'rxjs/Subject'
import { testable } from '../testable'
import { forEach, isNonNullable, parseHeaders } from '../utils'

export type AllowedHttpMethod = 'get' | 'post' | 'put' | 'delete'

export interface HttpErrorMessage {
  method: AllowedHttpMethod
  url: string
  error: Response
  body?: any
  [userDefinedKey: string]: any
}

export interface HttpResponseWithHeaders<T = any> {
  headers: Headers,
  body: T
}

type MethodParams = {
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

export const HttpError$ = new Subject<HttpErrorMessage>() as any as Observable<HttpErrorMessage>

export const createMethod = (method: AllowedHttpMethod) => (params: MethodParams): Observable<any> => {
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
        const realStatusCode = Number(respHeaders.get('x-http-status')) || respXHR.status
        if (realStatusCode >= 400) {
          Object.defineProperty(respXHR, 'status', { value: realStatusCode })
          throw new AjaxError(
            'ajax error',
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
          const realStatusCode = Number(response.headers.get('x-http-status')) || response.status
          if (realStatusCode >= 200 && realStatusCode < 400) {
            headers = response.headers
            return response.text()
          } else {
            Object.defineProperty(response, 'status', { value: realStatusCode })
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

export const getHttpWithResponseHeaders = <T>(
  url?: string,
  errorAdapter$?: Subject<HttpErrorMessage>
): Http<HttpResponseWithHeaders<T>> => {
  return new Http<HttpResponseWithHeaders<T>>(url, errorAdapter$, true)
}

export class Http<T> {
  private errorAdapter$: Subject<HttpErrorMessage>
  private cloned = false
  private request: Observable<T> | undefined
  public mapFn: (v$: Observable<T>) => Observable<any> = (dist$ => dist$)

  private static get = createMethod('get')
  private static put = createMethod('put')
  private static post = createMethod('post')
  private static delete = createMethod('delete')

  private static defaultOpts = () => ({
    headers: {},
    credentials: 'include'
  })

  constructor(
    private url: string = '',
    errorAdapter$?: Subject<HttpErrorMessage>,
    private readonly includeHeaders: boolean = false
  ) {
    if (errorAdapter$) {
      this.errorAdapter$ = errorAdapter$
    } else {
      this.errorAdapter$ = HttpError$ as Subject<HttpErrorMessage>
    }
  }

  private _opts: any = Http.defaultOpts()

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
    this._opts = Http.defaultOpts()
    return this
  }

  get() {
    this.request = Http.get(this.params())
    return this
  }

  post(body?: any) {
    this.request = Http.post({ ...this.params(), body })
    return this
  }

  put(body?: any) {
    this.request = Http.put({ ...this.params(), body })
    return this
  }

  delete(body?: any) {
    this.request = Http.delete({ ...this.params(), body })
    return this
  }

  send(): Observable<T> {
    if (!this.request) {
      return Observable.empty<T>()
    }
    const response$ = this.mapFn(this.request)
    return response$
      .catch((msg: HttpErrorMessage) => {
        const msgClone = { ...msg, error: msg.error.clone() }
        setTimeout(() => {
          this.errorAdapter$.next(msgClone)
        }, 10)
        return Observable.throw(msg)
      })
  }

  clone() {
    const result = new Http<T>(this.url, this.errorAdapter$)
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
