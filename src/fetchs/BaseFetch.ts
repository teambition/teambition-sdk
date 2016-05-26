'use strict'
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
