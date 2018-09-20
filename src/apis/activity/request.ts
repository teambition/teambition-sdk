import { Observable } from 'rxjs'
import { SDKFetch } from '../../SDKFetch'
import { ActivitySchema } from '../../schemas'
import { ActivityId } from 'teambition-types'

export function recallChatMessageFetch(
  this: SDKFetch,
  activityId: ActivityId
): Observable<ActivitySchema> {
  return this.put<ActivitySchema>(`activities/${activityId}/recall`)
}

SDKFetch.prototype.recallChatMessage = recallChatMessageFetch

declare module '../../SDKFetch' {
  /*tslint:disable-next-line no-shadowed-variable*/
  interface SDKFetch {
    recallChatMessage: typeof recallChatMessageFetch
  }
}
