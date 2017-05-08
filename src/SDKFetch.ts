import 'rxjs/add/observable/defer'
import 'rxjs/add/operator/catch'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/publishReplay'
import 'rxjs/add/operator/finally'
import { Observable } from 'rxjs/Observable'
import { Fetch } from './utils/Fetch'
import { UserMe } from './schemas/UserMe'

export class SDKFetch extends Fetch {

  static FetchStack = new Map<string, Observable<any>>()
  static fetchTail: string | undefined | 0

  constructor() {
    super()
  }

  // @override
  get<T>(url: string, query?: any): Observable<T> {
    const tail = SDKFetch.fetchTail || Date.now()
    const uri = this._buildQuery(url, query)
    let _uri: string
    if (SDKFetch.FetchStack.has(uri)) {
      return SDKFetch.FetchStack.get(uri)!
    }
    if (query) {
      _uri = `${uri}&_=${ tail }`
    } else {
      _uri = `${uri}?_=${ tail }`
    }
    const dist = Observable.defer(() => this.createMethod('get')(_uri)
      .publishReplay(1)
      .refCount()
    )
      .finally(() => {
        SDKFetch.FetchStack.delete(uri)
      })

    SDKFetch.FetchStack.set(uri, dist)
    return dist
  }

  getUserMe() {
    return this.get<UserMe>('users/me')
  }
}
