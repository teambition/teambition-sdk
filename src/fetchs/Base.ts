'use strict'
import {Fetch} from '../utils/Fetch'
import {forEach} from '../utils/index'

export default class BaseAPI {
  public static fetch = new Fetch()

  protected fetch: Fetch

  constructor() {
    this.fetch = BaseAPI.fetch
  }

  protected buildQuery (data: any) {
    if (typeof data !== 'object') return ''
    let result: string[] = []
    forEach(data, (val: any, key: string) => {
      result.push(`${key}=${val}`)
    })
    return '?' + result.join('&')
  }
}
