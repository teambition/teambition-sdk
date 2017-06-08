import { Backend, SDKFetch, Http } from '../index'

function throwIfSlashPath(path: string) {
  if (path.charAt(0) === '/') {
    throw new Error(`There shouldn't be a slash before path (${path})`)
  }
}

export class MockFetch extends SDKFetch {
  private httpBackend = new Backend
  private apiHost = new Http<any>().getAPIHost()

  mockGet(path: string, query?: any) {
    throwIfSlashPath(path)
    return {
      mockResponse: this.httpBackend.whenGET(`${this.apiHost}/${path}`, query),
      request: this.get(path, query)
    }
  }

  mockPut(path: string, body?: any) {
    throwIfSlashPath(path)
    return {
      mockResponse: this.httpBackend.whenPUT(`${this.apiHost}/${path}`, body),
      request: this.put(path, body)
    }
  }

  mockPost(path: string, body?: any) {
    throwIfSlashPath(path)
    return {
      mockResponse: this.httpBackend.whenPOST(`${this.apiHost}/${path}`, body),
      request: this.post(path, body)
    }
  }

  mockDelete(path: string) {
    throwIfSlashPath(path)
    return {
      mockResponse: this.httpBackend.whenDELETE(`${this.apiHost}/${path}`),
      request: this.delete(path)
    }
  }
}
