'use strict'
import { Observable } from 'rxjs/Observable'
import { Fetch } from '../utils/Fetch'
import { forEach } from '../utils/index'

export default class BaseFetch {
  public static fetch = new Fetch()

  protected fetch: Fetch

  constructor() {
    this.fetch = BaseFetch.fetch
  }

  protected checkQuery(query: any) {
    forEach(query, (val: any, key: string) => {
      if (typeof val === 'undefined') {
        delete query[key]
      }
    })
    if (!Object.keys(query).length) {
      return null
    }
    return query
  }
}

const _allowedMethod = ['get', 'post', 'put', 'delete']
const _requestCache = new Map<string, Observable<any>>()

_allowedMethod.forEach(httpMethod => {
  BaseFetch.fetch.middleware(<any>httpMethod, args => {
    const namespace = args.url + JSON.stringify(args.queryOrBody)
    const cache = _requestCache.get(namespace)
    if (cache) {
      return cache
    } else {
      let result: Observable<any>
      const now = Date.now()
      if (httpMethod === 'get') {
        if (args.queryOrBody) {
          args.queryOrBody._ = now
        } else {
          args.queryOrBody = {
            _: now
          }
        }
      }
      result = args.originFn(args.url, args.queryOrBody)
        .map(r => {
          _requestCache.delete(namespace)
          if (httpMethod === 'get' && args.queryOrBody) {
            if (r instanceof Array) {
              forEach(r, ele => {
                ele._requested = now
              })
            } else {
              r._requested = now
            }
          }
          return r
        })
        .catch(e => {
          _requestCache.delete(namespace)
          return Observable.throw(e)
        })
        .publishReplay(1)
        .refCount()
      _requestCache.set(namespace, result)
      return result
    }
  })
})
