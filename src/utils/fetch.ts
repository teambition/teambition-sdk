'use strict'
import {assign} from './index'

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

  get(url: string) {
    return fetch(Fetch.apiHost + url, assign({
      method: 'get'
    }, Fetch.opts))
    .then(data => {
      return data.json()
    })
  }

  post(url: string, data?: any) {
    return fetch(Fetch.apiHost + url, assign({
      method: 'post',
      body: JSON.stringify(data)
    }, Fetch.opts))
    .then(data => {
      return data.json()
    })
  }

  put(url: string, data?: any) {
    return fetch(Fetch.apiHost + url, assign({
      method: 'put',
      body: JSON.stringify(data)
    }, Fetch.opts))
    .then(data => {
      return data.json()
    })
  }

  delete(url: string) {
    return fetch(Fetch.apiHost + url, assign({
      method: 'delete'
    }, Fetch.opts))
    .then(data => {
      return data.json()
    })
  }

}
