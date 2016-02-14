'use strict'
import TbFetch from '../utils/fetch'

const tbFetch = new TbFetch()

export default class BaseAPI {
  public static tbFetch = tbFetch

  protected tbFetch: TbFetch

  constructor() {
    this.tbFetch = tbFetch
  }
}
