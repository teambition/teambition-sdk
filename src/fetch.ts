'use strict'
import {assign} from './utils'

export default class Fetch {

  private opts: any = {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }

  constructor(private token: string) {
    if (!token) {
      this.opts = {
        credentials: 'include'
      }
    }else {
      this.opts.headers.Authorization = `OAuth2 ${token}`
    }
  }

  get(url: string) {
    return fetch(url, assign({
      method: 'get'
    }, this.opts))
  }

  post(url: string, data?: any) {
    return fetch(url, assign({
      method: 'post',
      body: JSON.stringify(data)
    }, this.opts))
  }

  put(url: string, data?: any) {
    return fetch(url, assign({
      method: 'put',
      body: JSON.stringify(data)
    }, this.opts))
  }

  delete(url: string) {
    return fetch(url, assign({
      method: 'delete'
    }, this.opts))
  }
}
