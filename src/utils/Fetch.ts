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

  get get () { return this.createMethod('get') }
  get post () { return this.createMethod('post') }
  get put () { return this.createMethod('put') }
  get delete () { return this.createMethod('delete') }

  private createMethod<T>(method: String) {
    return (url: String, body?: any): Promise<T> => {
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
