'use strict'
import { assign, forEach } from './index'

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

  public setAPIHost(host: string) {
    this._apiHost = host
  }

  public setToken(token: string) {
    delete this._opts.credentials
    this._opts.headers.Authorization = `OAuth2 ${token}`
  }

  public restore() {
    this._opts = {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      credentials: 'include'
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
          } else {
            return Promise.reject<T>(<any>response)
          }
        })
    }
  }
}
