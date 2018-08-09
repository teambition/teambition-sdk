import 'rxjs/add/observable/dom/ajax'
import 'rxjs/add/observable/empty'
import 'rxjs/add/operator/catch'
import 'rxjs/add/operator/map'
import { AjaxError } from 'rxjs/observable/dom/AjaxObservable'
import { Observable } from 'rxjs/Observable'
import { Observer } from 'rxjs/Observer'
import { Subject } from 'rxjs/Subject'
import { parseHeaders } from '../utils/index'
import { testable } from '../testable'
import { forEach } from '../utils'

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
  errorAdapter$: Subject<HttpErrorMessage>,
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
    if (normHeaders[val] != null) {
      normHeaders[key] = normHeaders[val]
      delete normHeaders[val]
    }
  })
}

export const HttpError$ = new Subject<HttpErrorMessage>() as any as Observable<HttpErrorMessage>

export const createMethod = (method: AllowedHttpMethod) => (params: MethodParams): Observable<any> => {
  const { url, body, _opts, errorAdapter$, includeHeaders } = params

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
        if (!includeHeaders) {
          return respBody
        }
        const respHeaders = parseHeaders(value.xhr.getAllResponseHeaders())
        return { headers: respHeaders, body: respBody }
      })
      .catch((e: AjaxError) => {
        const headers = e.xhr.getAllResponseHeaders()
        const errorResponse = new Response(new Blob([JSON.stringify(e.xhr.response)]), {
          status: e.xhr.status,
          statusText: e.xhr.statusText,
          headers: headers.length ? parseHeaders(headers) : new Headers()
        })
        const requestInfo = { method, url, body }
        const errorResponseClone = errorResponse.clone()

        setTimeout(() => {
          errorAdapter$.next({ ...requestInfo, error: errorResponseClone })
        }, 10)
        return Observable.throw({ ...requestInfo, error: errorResponse })
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
          const requestInfo = { method, url, body }
          const errorResponseClone = errorResponse.clone()

          setTimeout(() => {
            errorAdapter$.next({ ...requestInfo, error: errorResponseClone })
          }, 10)
          observer.error({ ...requestInfo, error: errorResponse })
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
    return this.request ? this.mapFn(this.request) : Observable.empty()
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
    errorAdapter$: this.errorAdapter$,
    includeHeaders: this.includeHeaders
  })
}
