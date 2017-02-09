import { Observable } from 'rxjs/Observable'
import { SDK } from '../../SDK'
import { SDKFetch } from '../../SDKFetch'

export function updateUserFetch<T> (
  this: SDKFetch,
  patch: T
): Observable<T> {
  return this.put('/users', patch)
}

SDKFetch.prototype.updateUser = updateUserFetch

declare module '../../SDKFetch' {
  interface SDKFetch {
    updateUser: typeof updateUserFetch
  }
}

export function updateUser<T>(
  this: SDK,
  patch: T
): Observable<T> {
  return this.lift({
    request: this.fetch.updateUser(patch),
    tableName: 'User',
    method: 'update',
    clause: { }
  })
}

SDK.prototype.updateUser = updateUser

declare module '../../SDK' {
  interface SDK {
    updateUser: typeof updateUser
  }
}
