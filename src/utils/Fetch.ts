'use strict'
import 'isomorphic-fetch'
import 'rxjs/add/observable/dom/ajax'
import 'rxjs/add/operator/debounceTime'
import { AjaxError } from 'rxjs/observable/dom/AjaxObservable'
import { Observable } from 'rxjs/Observable'
import { Observer } from 'rxjs/Observer'
import { Subject } from 'rxjs/Subject'
import { assign, forEach, parseHeaders } from './index'
import { testable } from '../testable'

export type AllowedHttpMethod = 'get' | 'post' | 'put' | 'delete'

export interface HttpErrorMessage {
  method: AllowedHttpMethod
  url: string
  error: Response
  body?: any
}

const allowedHttpMethod = ['get', 'post', 'put', 'delete']

export const HttpError$: Observable<HttpErrorMessage> = new Subject<HttpErrorMessage>()

export class Fetch {

  private _opts: any = {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  }

  private _apiHost = 'https://www.teambition.com/api/'

  public getAPIHost(): string {
    return this._apiHost
  }

  public setAPIHost(host: string): void {
    this._apiHost = host
  }

  public setHeaders(headers: any): void {
    assign(this._opts.headers, headers)
  }

  public setToken(token: string): void {
    delete this._opts.credentials
    this._opts.headers.Authorization = `OAuth2 ${token}`
  }

  public setOpts(opts: any): void {
    assign(this._opts, opts)
  }

  public restore(): void {
    this._opts = {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    }
  }

  public middleware(method: AllowedHttpMethod, decorator: (args?: {
    url: string
    originFn: (url: string, queryOrBody?: any) => Observable<any>
    queryOrBody?: any
  }) => any): void {
    if (allowedHttpMethod.indexOf(method) === -1) {
      throw new Error(`method to decorator is not defined or not allowed: ${method}`)
    }
    const originMethod = this[method]
    this[method] = function(url: string, queryOrBody: any) {
      const calledArgs = {
        url: url,
        queryOrBody: queryOrBody,
        originFn: originMethod.bind(this)
      }
      return decorator(calledArgs)
    }
  }

  public get <T>(url: string, query?: any) {
    const uri = this._buildQuery(url, query)
    return this.createMethod<T>('get')(uri)
  }

  public post <T>(url: string, body?: any) {
    return this.createMethod<T>('post')(url, body)
  }

  public put <T>(url: string, body?: any) {
    return this.createMethod<T>('put')(url, body)
  }

  public delete <T>(url: string) {
    return this.createMethod<T>('delete')(url)
  }

  private _buildQuery (url: string, query: any) {
    if (typeof query !== 'object' || !query) {
      return url
    }
    let result: string[] = []
    forEach(query, (val: any, key: string) => {
      if (Array.isArray(val)) {
        (<any[]>val).forEach(val => {
          result.push(`${key}=${val}`)
        })
      } else {
        result.push(`${key}=${val}`)
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

  private createMethod<T>(method: AllowedHttpMethod): (url: string, body?: any) => Observable<any> {
    return (url: string, body?: any): Observable<T> => {
      if (testable.UseXMLHTTPRequest && typeof window !== 'undefined') {
        return Observable.ajax({
          url: this._apiHost + url,
          body, method,
          headers: this._opts.headers,
          withCredentials: this._opts.credentials === 'include',
          responseType: this._opts.responseType || 'json',
          crossDomain: typeof this._opts.crossDomain !== 'undefined' ? !!this._opts.crossDomain : true
        })
          .map(value => {
            const resp = value.response
            try {
              return JSON.parse(resp)
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
              (<Subject<HttpErrorMessage>>HttpError$).next(sdkError)
            }, 10)
            return Observable.throw(sdkError)
          })
      } else {
        return Observable.create((observer: Observer<any>) => {
          const options = assign({
            method: method
          }, this._opts)
          if (body) {
            options.body = typeof body === 'object' ? JSON.stringify(body) : body
          }
          fetch(this._apiHost + url, options)
            .then((response: Response): Promise<string> => {
              if (response.status >= 200 && response.status < 400) {
                return response.text()
              } else {
                throw response
              }
            })
            .then(r => {
              try {
                const result = JSON.parse(r)
                observer.next(result)
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
                (<Subject<HttpErrorMessage>>HttpError$).next(sdkError)
              }, 10)
              observer.error(sdkError)
            })
        })
      }
    }
  }
}
