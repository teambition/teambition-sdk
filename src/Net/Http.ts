import 'rxjs/add/observable/dom/ajax'
import 'rxjs/add/operator/catch'
import 'rxjs/add/operator/map'
import { AjaxError } from 'rxjs/observable/dom/AjaxObservable'
import { Observable } from 'rxjs/Observable'
import { Observer } from 'rxjs/Observer'
import { Subject } from 'rxjs/Subject'
import { parseHeaders, headers2Object } from '../utils/index'
import { testable } from '../testable'

export type AllowedHttpMethod = 'get' | 'post' | 'put' | 'delete'

export interface HttpErrorMessage {
  method: AllowedHttpMethod
  url: string
  error: Response
  body?: any
}

export const HttpError$ = new Subject<HttpErrorMessage>() as any as Observable<HttpErrorMessage>

export class Http<T> {
  private errorAdapter$: Subject<HttpErrorMessage>
  private cloned = false
  private request: Observable<T>
  public mapFn: (v$: Observable<T>) => Observable<any> = (dist$ => dist$)

  constructor(private url: string, errorAdapter$?: Subject<HttpErrorMessage>) {
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

  public map<U>(fn: (stream$: Observable<T>) => Observable<U>) {
    this.mapFn = fn
    return this as any as Http<U>
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

  public get() {
    this.request = this.createMethod('get')(this.url)
    return this
  }

  public post(body?: any) {
    this.request = this.createMethod('post')(this.url, body)
    return this
  }

  public put(body?: any) {
    this.request = this.createMethod('put')(this.url, body)
    return this
  }

  public delete(body?: any) {
    this.request = this.createMethod('delete')(this.url, body)
    return this
  }

  public send(): Observable<T> {
    return this.mapFn(this.request)
  }

  public clone() {
    const result = new Http<T>(this.url, this.errorAdapter$)
    if (!this.cloned && this.request) {
      this.request = this.request.publishReplay(1).refCount()
      this.cloned = true
      result.cloned = true
    }
    result.request = this.request
    return result
  }

  public createMethod(method: AllowedHttpMethod): (url: string, body?: any) => Observable<T> {
    return (url: string, body?: any) => {
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
