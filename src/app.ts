'use strict'
import Fetch from './fetch'
import {token} from './token'

class Api {
  private fetch: Fetch

  constructor(private token?: string) {
    this.fetch = new Fetch(token)
  }
}
