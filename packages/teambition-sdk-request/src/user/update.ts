import { Observable } from 'rxjs/Observable'
import { SDK, SDKFetch } from 'teambition-sdk-core'

export function updateUserFetch<T> (
  this: SDKFetch,
  patch: T
): Observable<T> {
  return this.put<T>('users', patch)
}

SDKFetch.prototype.updateUser = updateUserFetch

declare module 'teambition-sdk-core/dist/cjs/SDKFetch' {
  // tslint:disable-next-line no-shadowed-variable
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

declare module 'teambition-sdk-core/dist/cjs/SDK' {
  // tslint:disable-next-line no-shadowed-variable
  interface SDK {
    updateUser: typeof updateUser
  }
}
