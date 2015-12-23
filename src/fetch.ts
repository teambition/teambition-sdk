'use strict'
import {assign, forEach} from './utils'

let apiHost = 'https://api.teambition.com'
const apiPath = ['Version', 'Type', 'Id', 'Path1', 'Path2', 'Path3']

interface IRestPaths {
  Version?: string;
  Type: string;
  Id?: string;
  Path1?: string;
  Path2?: string;
  Path3?: string;
  _boundToObjectId?: string;
  fields?: string;
  [index: string]: any;
}

class Fetch {

  private opts: any = {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }

  constructor() {
    this.opts.credentials = 'include'
    apiHost = 'https://www.teambition.com/api'
  }

  setToken(token: string) {
    delete this.opts.credentials
    this.opts.headers.Authorization = `OAuth2 ${token}`
  }

  get(paths: IRestPaths) {
    const url = this.buildURI(paths)
    return fetch(url, assign({
      method: 'get'
    }, this.opts))
    .then((data: Response) => {
      return data.json()
    })
  }

  post(paths: IRestPaths, data?: any) {
    const url = this.buildURI(paths)
    return fetch(url, assign({
      method: 'post',
      body: JSON.stringify(data)
    }, this.opts))
    .then((data: Response) => {
      return data.json()
    })
  }

  put(paths: IRestPaths, data?: any) {
    const url = this.buildURI(paths)
    return fetch(url, assign({
      method: 'put',
      body: JSON.stringify(data)
    }, this.opts))
    .then((data: Response) => {
      return data.json()
    })
  }

  delete(paths: IRestPaths) {
    const url = this.buildURI(paths)
    return fetch(url, assign({
      method: 'delete'
    }, this.opts))
    .then((data: Response) => {
      return data.json()
    })
  }

  private buildURI(path: IRestPaths) {
    let uris = []
    let querys = []
    forEach(path, (val: string, key: string) => {
      const position = apiPath.indexOf(key)
      if (position !== -1) {
        uris[position] = val
      }else {
        querys.push(`${key}=${val}`)
      }
    })
    let url = apiHost + uris.join('/')
    url = querys.length ? url + '?' + querys.join('&') : url
    return url
  }
}

export const tbFetch = new Fetch()
