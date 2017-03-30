import { Backend, SDKFetch } from '../index'

function throwIfSlashPath(path: string) {
  if (path.charAt(0) === '/') {
    throw new Error(`There shouldn't be a slash before path (${path})`)
  }
}

export class MockFetch extends SDKFetch {
  private httpBackend = new Backend

  mockGet(path: string, query?: any) {
    throwIfSlashPath(path)
    return (f: SDKFetch) => {
      const apiHost = f.getAPIHost()
      return {
        mockResponse: this.httpBackend.whenGET(`${apiHost}/${path}`, query),
        request: this.get(path, query)
      }
    }
  }

  mockPut(path: string, body?: any) {
    throwIfSlashPath(path)
    return (f: SDKFetch) => {
      const apiHost = f.getAPIHost()
      return {
        mockResponse: this.httpBackend.whenPUT(`${apiHost}/${path}`, body),
        request: this.put(path, body)
      }
    }
  }

  mockPost(path: string, body?: any) {
    throwIfSlashPath(path)
    return (f: SDKFetch) => {
      const apiHost = f.getAPIHost()
      return {
        mockResponse: this.httpBackend.whenPOST(`${apiHost}/${path}`, body),
        request: this.post(path, body)
      }
    }
  }

  mockDelete(path: string) {
    throwIfSlashPath(path)
    return (f: SDKFetch) => {
      const apiHost = f.getAPIHost()
      return {
        mockResponse: this.httpBackend.whenDELETE(`${apiHost}/${path}`),
        request: this.delete(path)
      }
    }
  }
}
