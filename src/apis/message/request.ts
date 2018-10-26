import { Observable } from 'rxjs/Observable'
import { SDKFetch } from '../../SDKFetch'
import { MessageSchema } from '../../schemas/Message'
import { MessageId } from 'teambition-types'

export function getMessageFetch(
  this: SDKFetch,
  messageId: MessageId,
  query?: {}
): Observable<MessageSchema> {
  return this.get<MessageSchema>(`v2/messages/${messageId}`, query)
}

export function getMessagesFetch(
  this: SDKFetch,
  query?: any
): Observable<MessageSchema[]> {
  return this.get<MessageSchema[]>(`v2/messages`, query)
}

export namespace MarkRead {
  export type PayloadForOne = {
    isRead: boolean
    unreadActivitiesCount: number
  }

  export type PayloadForAll = {
    type: string
  }
}

export function markMessageRead(
  this: SDKFetch,
  messageId: MessageId,
  body: MarkRead.PayloadForOne
): Observable<MarkRead.PayloadForOne> {
  return this.put<MarkRead.PayloadForOne>(`messages/${ messageId }`, body)
}

export function markAllMessagesRead(
  this: SDKFetch,
  body: MarkRead.PayloadForAll
): Observable<void> {
  return this.put<void>(`messages/markallread`, body)
}

export function deleteMessageFetch(
  this: SDKFetch,
  _MessageId: MessageId
): Observable<object> {
  return this.delete(`messages/${_MessageId}`)
}

export function deleteReadedMessagesFetch(
  this: SDKFetch
): Observable<object> {
  return this.delete('messages?type=private')
}

SDKFetch.prototype.getMessage = getMessageFetch
SDKFetch.prototype.getMessages = getMessagesFetch
SDKFetch.prototype.markMessageRead = markMessageRead
SDKFetch.prototype.markAllMessagesRead = markAllMessagesRead
SDKFetch.prototype.deleteMessage = deleteMessageFetch
SDKFetch.prototype.deleteReadedMessages = deleteReadedMessagesFetch

declare module '../../SDKFetch' {
  /*tslint:disable no-shadowed-variable*/
  interface SDKFetch {
    getMessage: typeof getMessageFetch
    getMessages: typeof getMessagesFetch
    markMessageRead: typeof markMessageRead
    markAllMessagesRead: typeof markAllMessagesRead
    deleteMessage: typeof deleteMessageFetch
    deleteReadedMessages: typeof deleteReadedMessagesFetch
  }
}
