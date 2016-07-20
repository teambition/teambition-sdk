'use strict'
import { assign, forEach } from './index'

export type AllowedHttpMethod = 'get' | 'post' | 'put' | 'delete'

const allowedHttpMethod = ['get', 'post', 'put', 'delete']

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
    originFn: (url: string, queryOrBody?: any) => Promise<any>
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
    const queryString = this._buildQuery(query)
    return this.createMethod<T>('get')(url + queryString)
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

  private _buildQuery (query: any) {
    if (typeof query !== 'object' || !query) {
      return ''
    }
    let result: string[] = []
    forEach(query, (val: any, key: string) => {
      result.push(`${key}=${val}`)
    })
    return result.length ? '?' + result.join('&') : ''
  }

  private createMethod<T>(method: String): (url: string, body?: any) => Promise<T> {
    return (url: string, body?: any): Promise<T> => {
      const options = assign({
        method: method
      }, this._opts)
      if (body) {
        options.body = typeof body === 'object' ? JSON.stringify(body) : body
      }

      return fetch(this._apiHost + url, options)
        .then((response: Response): Promise<T> => {
          if (response.status >= 200 && response.status < 300) {
            return response.json<T>()
              .catch(e => {
                return ''
              })
          } else {
            return Promise.reject<T>(<any>response)
          }
        })
    }
  }
}
