import { Observable } from 'rxjs/Observable'
import { SDKFetch } from '../../SDKFetch'
import { SDK } from '../../SDK'

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

declare module '../../SDKFetch' {
  interface SDKFetch { // tslint:disable-line:no-shadowed-variable
    getMyCount: typeof getMyCountFetch
  }
}

export function getMyCount(
  this: SDK
): Observable<MyCountData> {
  return this.fetch.getMyCount()
}

SDK.prototype.getMyCount = getMyCount

declare module '../../SDK' {
  interface SDK { // tslint:disable-line:no-shadowed-variable
    getMyCount: typeof getMyCount
  }
}
