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

  public static setAPIHost(host: string) {
    Fetch.apiHost = host
  }

  public static setToken(token: string) {
    delete Fetch.opts.credentials
    Fetch.opts.headers.Authorization = `OAuth2 ${token}`
    Fetch.apiHost = 'https://api.teambition.com'
  }

  get<T>(url: string): Promise<T> {
    return fetch(Fetch.apiHost + url, assign({
      method: 'get'
    }, Fetch.opts))
    .then(this._dataHandle)
  }

  post<T>(url: string, data?: any): Promise<T> {
    return fetch(Fetch.apiHost + url, assign({
      method: 'post',
      body: JSON.stringify(data)
    }, Fetch.opts))
    .then(this._dataHandle)
  }

  put<T>(url: string, data?: any): Promise<T> {
    return fetch(Fetch.apiHost + url, assign({
      method: 'put',
      body: JSON.stringify(data)
    }, Fetch.opts))
    .then(this._dataHandle)
  }

  delete<T>(url: string): Promise<T> {
    return fetch(Fetch.apiHost + url, assign({
      method: 'delete'
    }, Fetch.opts))
    .then(this._dataHandle)
  }

  private _dataHandle <T>(data: Response): Promise<T> {
    const status = data.status
    if (status >= 400 || status === 0) return Promise.reject<any>(data)
    return data.json()
  }

}
