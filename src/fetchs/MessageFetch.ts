'use strict'
import { Observable } from 'rxjs/Observable'
import BaseFetch from './BaseFetch'
import { MessageData } from '../schemas/Message'

export interface GetMessageOptions {
  type?: string
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
  _id: string
  isLater: boolean
  updated: string
  reminder: {
    updated: string
    reminderDate: string
  }
  msgType: string
}

export class MessageFetch extends BaseFetch {
  getMessages(query?: GetMessageOptions): Observable<MessageData[]> {
    return this.fetch.get(`v2/messages`, query)
  }

  read(_id: string): Observable<ReadResponse> {
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

  snooze(_id: string, date: string): Observable<SnoozeResponse> {
    return this.fetch.put(`messages/${_id}/later`, {
      isLater: true,
      reminderDate: date
    })
  }

  delete(_id: string): Observable<{}> {
    return this.fetch.delete(`messages/${_id}`)
  }

  deleteAllRead(type: string): Observable<{}> {
    return this.fetch.delete(`messages?type=${type}`)
  }
}

export default new MessageFetch()
