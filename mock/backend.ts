'use strict'
import {HttpResponse} from './response'

class Backend {
  whenGET(uri: string) {
    return new HttpResponse(uri, 'get')
  }

  whenPUT(uri: string, data?: any) {
    return new HttpResponse(uri, 'put', data)
  }

  whenPOST(uri: string, data: any) {
    return new HttpResponse(uri, 'post', data)
  }

  whenDELETE(uri: string) {
    return new HttpResponse(uri, 'delete')
  }
}

export const httpBackend = new Backend()
