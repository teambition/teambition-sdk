'use strict'
import { HttpResponse } from './response'
import { fetchStack, flushStack, restore, mockFetch } from './mock'

export const flushState = {
  flushed: false
}

export class Backend {

  constructor() {
    flushState.flushed = false
    fetchStack.clear()
    flushStack.clear()
    mockFetch()
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
    flushState.flushed = true
    flushStack.forEach(val => {
      if (val.resolve) {
        val.resolve(val.response)
      }
    })
  }

  restore(): void {
    restore()
  }

}
