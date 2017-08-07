import { Observable } from 'rxjs/Observable'
import { SDK, SDKFetch } from 'teambition-sdk-core'

export function addEmailFetch (
  this: SDKFetch,
  email: string
): Observable<any> {
  return this.post<any>('users/email', { email })
}

SDKFetch.prototype.addEmail = addEmailFetch

declare module 'teambition-sdk-core/dist/cjs/SDKFetch' {
  // tslint:disable-next-line no-shadowed-variable
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

declare module 'teambition-sdk-core/dist/cjs/SDK' {
  // tslint:disable-next-line no-shadowed-variable
  interface SDK {
    addEmail: typeof addEmail
  }
}
