import { Backend, SDKFetch } from '../index'

export class MockFetch extends SDKFetch {
  private httpBackend = new Backend

  mockGet(url: string, query?: any) {
    return (f: SDKFetch) => {
      const apiHost = f.getAPIHost()
      return {
        mockResponse: this.httpBackend.whenGET(`${apiHost}${url}`, query),
        request: this.get(url, query)
      }
    }
  }

  mockPut(url: string, body?: any) {
    return (f: SDKFetch) => {
      const apiHost = f.getAPIHost()
      return {
        mockResponse: this.httpBackend.whenPUT(`${apiHost}${url}`, body),
        request: this.put(url, body)
      }
    }
  }

  mockPost(url: string, body?: any) {
    return (f: SDKFetch) => {
      const apiHost = f.getAPIHost()
      return {
        mockResponse: this.httpBackend.whenPOST(`${apiHost}${url}`, body),
        request: this.post(url, body)
      }
    }
  }

  mockDelete(url: string) {
    return (f: SDKFetch) => {
      const apiHost = f.getAPIHost()
      return {
        mockResponse: this.httpBackend.whenDELETE(`${apiHost}${url}`),
        request: this.delete(url)
      }
    }
  }
}
