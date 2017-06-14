import 'rxjs/add/observable/dom/ajax'
import 'rxjs/add/operator/catch'
import 'rxjs/add/operator/map'
import { AjaxError } from 'rxjs/observable/dom/AjaxObservable'
import { Observable } from 'rxjs/Observable'
import { Observer } from 'rxjs/Observer'
import { Subject } from 'rxjs/Subject'
import { forEach, parseHeaders, headers2Object } from '../utils/index'
import { testable } from '../testable'

export type AllowedHttpMethod = 'get' | 'post' | 'put' | 'delete'

export interface HttpErrorMessage {
  method: AllowedHttpMethod
  url: string
  error: Response
  body?: any
}

export const HttpError$: Observable<HttpErrorMessage> = new Subject<HttpErrorMessage>()

export class Http<T> {
  private errorAdapter$: Subject<HttpErrorMessage>
  public request: () => Observable<T>
  public mapFn: <U>(stream$: Observable<T>) => Observable<U> = (dist$: Observable<T>) => dist$

  constructor(errorAdapter$?: Subject<HttpErrorMessage>) {
    if (errorAdapter$) {
      this.errorAdapter$ = errorAdapter$
    } else {
      this.errorAdapter$ = HttpError$ as Subject<HttpErrorMessage>
    }
  }

  private _opts: any = {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  }

  private _apiHost = 'https://www.teambition.com/api'

  public map<U>(fn: (stream$: Observable<T>) => Observable<U>) {
    this.mapFn = fn
    return this as any as Http<U>
  }

  public getAPIHost(): string {
    return this._apiHost
  }

  public setAPIHost(host: string) {
    this._apiHost = host
    return this
  }

  public setHeaders(headers: any) {
    this._opts.headers = { ...this._opts.headers, ...headers }
    return this
  }

  public setToken(token: string) {
    delete this._opts.credentials
    this._opts.headers.Authorization = `OAuth2 ${token}`
    return this
  }

  public setOpts(opts: any) {
    this._opts = { ...this._opts, ...opts }
    return this
  }

  public restore() {
    this._opts = {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    }
    return this
  }

  public get(url: string, query?: any) {
    const uri = this._buildQuery(url, query)
    this.request = this.createMethod('get')(uri)
    return this
  }

  public post(url: string, body?: any) {
    this.request = this.createMethod('post')(url, body)
    return this
  }

  public put(url: string, body?: any) {
    this.request = this.createMethod('put')(url, body)
    return this
  }

  public delete(url: string) {
    this.request = this.createMethod('delete')(url)
    return this
  }

  public send(): Observable<T> {
    return this.mapFn(this.request())
  }

  public _buildQuery(url: string, query: any) {
    if (typeof query !== 'object' || !query) {
      return url
    }
    const result: string[] = []
    forEach(query, (val: any, key: string) => {
      if (Array.isArray(val)) {
        (<any[]>val).forEach(_val => {
          if (typeof _val !== 'undefined') {
            result.push(`${key}=${_val}`)
          }
        })
      } else {
        if (typeof val !== 'undefined') {
          result.push(`${key}=${val}`)
        }
      }
    })
    let _query: string
    if (url.indexOf('?') !== -1) {
      _query = result.length ? '&' + result.join('&') : ''
    } else {
      _query = result.length ? '?' + result.join('&') : ''
    }
    return url + _query
  }

  public createMethod(method: AllowedHttpMethod): (path: string, body?: any) => () => Observable<T> {
    return (path: string, body?: any) => {
      return () => {
        const url = `${this._apiHost}/${path}`
        /* istanbul ignore if */
        if (testable.UseXMLHTTPRequest && typeof window !== 'undefined') {
          return Observable.ajax({
            url, body, method,
            headers: this._opts.headers,
            withCredentials: this._opts.credentials === 'include',
            responseType: this._opts.responseType || 'json',
            crossDomain: typeof this._opts.crossDomain !== 'undefined' ? !!this._opts.crossDomain : true
          })
            .map(value => {
              const resp = value.response
              const headers = value.xhr.getAllResponseHeaders()
              try {
                const result = JSON.parse(resp)
                const requestId = parseHeaders(headers)['x-request-id']
                return requestId ? { ...result, requestId } : result
              } catch (e) {
                return resp
              }
            })
            .catch((e: AjaxError) => {
              const headers = e.xhr.getAllResponseHeaders()
              const sdkError: HttpErrorMessage = {
                error: new Response(new Blob([JSON.stringify(e.xhr.response)]), {
                  status: e.xhr.status,
                  statusText: e.xhr.statusText,
                  headers: headers.length ? new Headers(parseHeaders(headers)) : new Headers()
                }),
                method, url, body
              }

              setTimeout(() => {
                this.errorAdapter$.next(sdkError)
              }, 10)
              return Observable.throw(sdkError)
            })
        } else {
          return Observable.create((observer: Observer<any>) => {
            const _options = {
              ... this._opts,
              method: method
            }
            if (body) {
              _options.body = typeof body === 'object' ? JSON.stringify(body) : body
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
              .then(r => {
                try {
                  const result = JSON.parse(r)
                  const requestId = headers2Object(headers)['x-request-id']
                  observer.next(requestId ? { ...result, requestId } : result)
                } catch (e) {
                  observer.next(r)
                }
                observer.complete()
              })
              .catch((e: Response) => {
                const sdkError: HttpErrorMessage = {
                  error: e,
                  method, url, body
                }

                setTimeout(() => {
                  this.errorAdapter$.next(sdkError)
                }, 10)
                observer.error(sdkError)
              })
          })
        }
      }
    }
  }
}
