'use strict'
import {Fetch} from '../utils/fetch'

const tbFetch = new Fetch()

export default class BaseAPI {
  public static tbFetch = tbFetch

  protected tbFetch: Fetch

  constructor() {
    this.tbFetch = tbFetch
  }
}
