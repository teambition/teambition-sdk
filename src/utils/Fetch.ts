'use strict'
import {assign} from './index'

require('isomorphic-fetch')

export class Fetch {

  private static opts: any = {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  }

  private static apiHost = 'https://www.teambition.com/api'

  public static getAPIHost(): string {
    return Fetch.apiHost
  }

  public static setAPIHost(host: string) {
    Fetch.apiHost = host
  }

  public static setToken(token: string) {
    delete Fetch.opts.credentials
    Fetch.opts.headers.Authorization = `OAuth2 ${token}`
    Fetch.apiHost = 'https://api.teambition.com'
  }

  public get <T>(url: string, body?: any) {
     return this.createMethod<T>('get')(url, body)
  }

  public post <T>(url: string, body?: any) {
    return this.createMethod<T>('post')(url, body)
  }

  public put <T>(url: string, body?: any) {
    return this.createMethod<T>('put')(url, body)
  }

  public delete <T>(url: string, body?: any) {
    return this.createMethod<T>('delete')(url, body)
  }

  private createMethod<T>(method: String) {
    return (url: string, body?: any): Promise<T> => {
      let options = assign({
        method: method
      }, Fetch.opts)
      if (body) {
        options.body = body
      }
      return fetch(Fetch.apiHost + url, options)
        .then((response: Response) => {
          if (response.status >= 200 && response.status < 300) {
            return response.json<T>()
          } else {
            return Promise.reject<T>(response)
          }
        })
    }
  }
}
