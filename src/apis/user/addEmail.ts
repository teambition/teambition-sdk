import { Observable } from 'rxjs'
import { SDK } from '../../SDK'
import { SDKFetch } from '../../SDKFetch'

export function addEmailFetch (
  this: SDKFetch,
  email: string
): Observable<any> {
  return this.post<any>('users/email', { email })
}

SDKFetch.prototype.addEmail = addEmailFetch

declare module '../../SDKFetch' {
  interface SDKFetch {
    addEmail: typeof addEmailFetch
  }
}

export function addEmail(
  this: SDK,
  email: string
): Observable<any> {
  return this.lift({
    request: this.fetch.addEmail(email),
    tableName: 'User',
    clause: { },
    method: 'update'
  })
}

SDK.prototype.addEmail = addEmail

declare module '../../SDK' {
  interface SDK {
    addEmail: typeof addEmail
  }
}
