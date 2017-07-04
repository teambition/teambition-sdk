import 'rxjs/add/observable/defer'
import 'rxjs/add/operator/catch'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/publishReplay'
import 'rxjs/add/operator/finally'
import { Observable } from 'rxjs/Observable'
import { Http } from './Net/Http'
import { UserMe } from './schemas/UserMe'
import { forEach, isEmptyObject } from './utils/index'

export class SDKFetch {

  constructor(
    private apiHost: string = 'https://www.teambition.com/api',
    private token: string = '',
    private headers = {},
    private options = {}
  ) {}

  static FetchStack = new Map<string, Observable<any>>()
  static fetchTail: string | undefined | 0

  get<T>(path: string, query?: any) {
    const url = this.urlWithPath(path)
    const urlWithQuery = query ? this._buildQuery(url, query) : url
    const http = this.setOpts(new Http<T>(urlWithQuery))

    if (SDKFetch.FetchStack.has(urlWithQuery)) {
      // re-use connection when available
      http['request'] = SDKFetch.FetchStack.get(urlWithQuery)!
      return http
    }

    const tail = SDKFetch.fetchTail || Date.now()
    const urlWithTail = query && !isEmptyObject(query)
      ? `${ urlWithQuery }&_=${ tail }`
      : `${ urlWithQuery }?_=${ tail }`
    const dist = Observable.defer(() => http.createMethod('get')(urlWithTail)
      .publishReplay(1)
      .refCount()
    )
      .finally(() => {
        SDKFetch.FetchStack.delete(urlWithQuery)
      })

    SDKFetch.FetchStack.set(urlWithQuery, dist)
    http['request'] = dist
    return http
  }

  private urlWithPath(path: string): string {
    return `${this.apiHost}/${path}`
  }

  public post<T>(path: string, body?: any) {
    const http = this.setOpts<T>(new Http<T>(this.urlWithPath(path)))
    return http.post(body)
  }

  public put<T>(path: string, body?: any) {
    const http = this.setOpts<T>(new Http<T>(this.urlWithPath(path)))
    return http.put(body)
  }

  public delete<T>(path: string) {
    const http = this.setOpts<T>(new Http<T>(this.urlWithPath(path)))
    return http.delete()
  }

  public setAPIHost(host: string) {
    this.apiHost = host
  }

  public getAPIHost() {
    return this.apiHost
  }

  public setHeaders(headers: {}) {
    this.headers = headers
  }

  public setToken(token: string) {
    this.token = token
  }

  public setOptions(options: {}) {
    this.options = options
  }

  private setOpts<T>(http: Http<T>) {
    if (Object.keys(this.headers).length > 0) {
      http.setHeaders(this.headers)
    }
    if (this.token) {
      http.setToken(this.token)
    }
    if (Object.keys(this.options).length > 0) {
      http.setOpts(this.options)
    }
    return http
  }

  private _buildQuery(url: string, query: any) {
    if (typeof query !== 'object' || !query) {
      return url
    }
    const result: string[] = []
    forEach(query, (val: any, key: string) => {
      if (key === '_') {
        console.warn('query should not contain key \'_\', it will be ignored')
        return
      }
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

  getUserMe() {
    return this.get<UserMe>('users/me')
  }
}
