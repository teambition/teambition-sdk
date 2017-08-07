import { Observable } from 'rxjs/Observable'
import { SDK, SDKFetch } from 'teambition-sdk-core'

export interface MyCountData {
  favoritesCount: number
  notesCount: number
  organizationsCount: number
  reportCount: number
  subtasksCount: number
  tasksCount: number
}

export function getMyCountFetch(
  this: SDKFetch
): Observable<MyCountData> {
  return this.get<MyCountData>(`users/me/count`)
}

SDKFetch.prototype.getMyCount = getMyCountFetch

declare module 'teambition-sdk-core/dist/cjs/SDKFetch' {
  // tslint:disable-next-line no-shadowed-variable
  interface SDKFetch {
    getMyCount: typeof getMyCountFetch
  }
}

export function getMyCount(
  this: SDK
): Observable<MyCountData> {
  return this.fetch.getMyCount()
}

SDK.prototype.getMyCount = getMyCount

declare module 'teambition-sdk-core/dist/cjs/SDK' {
  // tslint:disable-next-line no-shadowed-variable
  interface SDK {
    getMyCount: typeof getMyCount
  }
}
