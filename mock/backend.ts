'use strict'
import {HttpResponse} from './response'
import {fetchStack} from './mock'
import {forEach} from './utils'

export const flushState = {
  flushed: false
}

export class Backend {

  constructor() {
    flushState.flushed = false
  }

  whenGET(uri: string) {
    return new HttpResponse(uri, 'get')
  }

  whenPUT(uri: string, data?: any) {
    return new HttpResponse(uri, 'put', data)
  }

  whenPOST(uri: string, data?: any) {
    return new HttpResponse(uri, 'post', data)
  }

  whenDELETE(uri: string) {
    return new HttpResponse(uri, 'delete')
  }

  flush() {
    forEach(fetchStack, (value: any, key: string) => {
      forEach(value.flushQueue, (resolves: any[]) => {
        resolves[0](resolves[1])
      })
    })
    flushState.flushed = true
  }
}
