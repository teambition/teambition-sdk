'use strict'
import { Observable } from 'rxjs/Observable'
import BaseFetch from './BaseFetch'
import { MessageData, MessageType } from '../schemas/Message'
import { MessageId } from '../teambition'

export type GetMessageType = 'normal' | 'private' | 'later' | 'all'

export interface GetMessageOptions {
  type?: GetMessageType
  sort?: string
  count?: number
  page?: number
}

export interface ReadResponse {
  isRead: boolean
  unreadActivitiesCount: number
  updated: string
}

export interface SnoozeResponse {
  _id: MessageId
  isLater: boolean
  updated: string
  reminder: {
    updated: string
    reminderDate: string
  }
  msgType: MessageType
}

export class MessageFetch extends BaseFetch {
  getMessages(query?: GetMessageOptions): Observable<MessageData[]> {
    return this.fetch.get(`v2/messages`, query)
  }

  read(_id: MessageId): Observable<ReadResponse> {
    return this.fetch.put(`messages/${_id}`, {
      isRead: true,
      unreadActivitiesCount: 0
    })
  }

  markAllAsRead(type: string): Observable<{}> {
    return this.fetch.put(`messages/markallread`, {
      type: type
    })
  }

  snooze(_id: MessageId, date: string): Observable<SnoozeResponse> {
    return this.fetch.put(`messages/${_id}/later`, {
      isLater: true,
      reminderDate: date
    })
  }

  delete(_id: MessageId): Observable<{}> {
    return this.fetch.delete(`messages/${_id}`)
  }

  deleteAllRead(type: string): Observable<{}> {
    return this.fetch.delete(`messages?type=${type}`)
  }
}

export default new MessageFetch
