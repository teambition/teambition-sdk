'use strict'
import {Fetch} from '../utils/Fetch'

const tbFetch = new Fetch()

export default class BaseAPI {
  public static fetch = tbFetch

  protected fetch: Fetch

  constructor() {
    this.fetch = BaseAPI.fetch
  }
}
