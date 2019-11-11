import 'rxjs/add/observable/throw'
import 'rxjs/add/observable/dom/ajax'
import 'rxjs/add/observable/empty'
import 'rxjs/add/operator/catch'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/publishReplay'
import { AjaxError } from 'rxjs/observable/dom/AjaxObservable'
import { Observable } from 'rxjs/Observable'
import { Observer } from 'rxjs/Observer'
import { testable } from '../testable'
import { forEach, isNonNullable, parseHeaders } from '../utils'
import { WebClient, AllowedHttpMethod, MethodParams } from './WebClient'

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

export class Http<T> extends WebClient<T> {
  private static get = createMethod('get')
  private static put = createMethod('put')
  private static post = createMethod('post')
  private static delete = createMethod('delete')

  private static defaultOpts = () => ({
    headers: {},
    credentials: 'include'
  })

  protected _opts: any = Http.defaultOpts()

  protected prepareRequest(method: AllowedHttpMethod, body?: any) {
    switch (method) {
      case 'get':
        this.request = Http.get(this.params)
        return this
      case 'post':
        this.request = Http.post({ ...this.params, body })
        return this
      case 'put':
        this.request = Http.put({ ...this.params, body })
        return this
      case 'delete':
        this.request = Http.delete({ ...this.params, body })
        return this
    }
    return this
  }

  restore() {
    this._opts = Http.defaultOpts()
    return this
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

}
