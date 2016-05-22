'use strict'
import { Fetch } from '../utils/Fetch'

export default class BaseAPI {
  public static fetch = new Fetch()

  protected fetch: Fetch

  constructor() {
    this.fetch = BaseAPI.fetch
  }
}
