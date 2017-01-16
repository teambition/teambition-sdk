'use strict'
import 'rxjs/add/operator/catch'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/publishReplay'
import { Observable } from 'rxjs/Observable'
import { Fetch } from './utils/Fetch'
import { forEach } from './utils/index'

export class SDKFetch extends Fetch {

  constructor() {
    super()
  }

  // @override
  get<T>(url: string, query?: any): Observable<T> {
    if (query) {
      query._ = Date.now()
    } else {
      query = {
        _: Date.now()
      }
    }
    const q = this.checkQuery(query)
    return super.get<T>(url, q)
  }

  private checkQuery(query: any) {
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
