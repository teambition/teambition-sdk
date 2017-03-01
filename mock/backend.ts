import { HttpResponse } from './response'
import { fetchStack, restore, mockFetch } from './mock'

export class Backend {

  constructor() {
    fetchStack.clear()
    mockFetch()
  }

  whenGET(uri: string, query?: any) {
    return new HttpResponse(uri, 'get', query)
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

  restore(): void {
    restore()
  }

}
