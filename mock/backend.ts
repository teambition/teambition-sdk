'use strict'
import { HttpResponse } from './response'
import { fetchStack, restore, mockFetch } from './mock'
import { forEach } from './utils'

export const flushState = {
  flushed: false
}

export class Backend {

  constructor() {
    flushState.flushed = false
    mockFetch()
  }

  whenGET(uri: string) {
    return new HttpResponse(uri.toLowerCase(), 'get')
  }

  whenPUT(uri: string, data?: any) {
    return new HttpResponse(uri.toLowerCase(), 'put', data)
  }

  whenPOST(uri: string, data?: any) {
    return new HttpResponse(uri.toLowerCase(), 'post', data)
  }

  whenDELETE(uri: string) {
    return new HttpResponse(uri.toLowerCase(), 'delete')
  }

  flush() {
    forEach(fetchStack, (value: any, key: string) => {
      forEach(value.flushQueue, (resolves: any[]) => {
        resolves[0](resolves[1])
      })
    })
    flushState.flushed = true
  }

  restore(): void {
    restore()
  }

}
