import { Observable } from 'rxjs'
import { SDKFetch } from '../../SDKFetch'
import { GroupId } from 'teambition-types'

export function subscribeGroupFetch(
  this: SDKFetch,
  groupId: GroupId,
  consumerId: string
): Observable<null> {
  return this.post<null>(`groups/${groupId}/subscribe`, { consumerId })
}

export function unsubscribeGroupFetch(
  this: SDKFetch,
  groupId: GroupId,
  consumerId: string
): Observable<null> {
  return this.delete<null>(`groups/${groupId}/subscribe`, { consumerId })
}

SDKFetch.prototype.subscribeGroup = subscribeGroupFetch
SDKFetch.prototype.unsubscribeGroup = unsubscribeGroupFetch

declare module '../../SDKFetch' {
  /*tslint:disable no-shadowed-variable*/
  interface SDKFetch {
    subscribeGroup: typeof subscribeGroupFetch,
    unsubscribeGroup: typeof unsubscribeGroupFetch
  }
}
