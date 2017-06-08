import 'rxjs/add/observable/defer'
import 'rxjs/add/operator/catch'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/publishReplay'
import 'rxjs/add/operator/finally'
import { Observable } from 'rxjs/Observable'
import { Http } from './Net/Http'
import { UserMe } from './schemas/UserMe'

export class SDKFetch {

  static FetchStack = new Map<string, () => Observable<any>>()
  static fetchTail: string | undefined | 0

  // @override
  get<T>(url: string, query?: any) {
    const http = new Http<T>()
    const tail = SDKFetch.fetchTail || Date.now()
    const uri = http._buildQuery(url, query)
    let _uri: string
    if (SDKFetch.FetchStack.has(uri)) {
      http.request = SDKFetch.FetchStack.get(uri)!
      return http
    }
    if (query) {
      _uri = `${uri}&_=${ tail }`
    } else {
      _uri = `${uri}?_=${ tail }`
    }
    const dist = Observable.defer(() => http.createMethod('get')(_uri)()
      .publishReplay(1)
      .refCount()
    )
      .finally(() => {
        SDKFetch.FetchStack.delete(uri)
      })

    SDKFetch.FetchStack.set(uri, () => dist)
    http.request = () => dist
    return http
  }

  public post<T>(url: string, body?: any) {
    const http = new Http<T>()
    return http.post(url, body)
  }

  public put<T>(url: string, body?: any) {
    const http = new Http<T>()
    return http.put(url, body)
  }

  public delete<T>(url: string) {
    const http = new Http<T>()
    return http.delete(url)
  }

  getUserMe() {
    return this.get<UserMe>('users/me')
  }
}
