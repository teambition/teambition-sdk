import 'rxjs/add/operator/catch'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/publishReplay'
import { Observable } from 'rxjs/Observable'
import { Fetch } from './utils/Fetch'
import { UserMe } from './schemas/UserMe'

export class SDKFetch extends Fetch {

  static FetchStack = new Map<string, Observable<any>>()

  constructor() {
    super()
  }

  // @override
  get<T>(url: string, query?: any): Observable<T> {
    const now = Date.now()
    const uri = this._buildQuery(url, query)
    let _uri: string
    if (SDKFetch.FetchStack.has(uri)) {
      return SDKFetch.FetchStack.get(uri)
    }
    if (query) {
      _uri = `${uri}&_=${ now }`
    } else {
      _uri = `${uri}?_=${ now }`
    }
    const dist = this.createMethod('get')(_uri)
      .do(() => {
        SDKFetch.FetchStack.delete(uri)
      })
      .publishReplay(1)
      .refCount()

    SDKFetch.FetchStack.set(uri, dist)
    return dist
  }

  getUserMe() {
    return this.get<UserMe>('users/me')
  }
}
