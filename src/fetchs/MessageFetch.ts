'use strict'
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
  getMessages(query?: GetMessageOptions): Promise<MessageData[]> {
    return this.fetch.get(`messages`, query)
  }

  read(_id: string): Promise<ReadResponse> {
    return this.fetch.put(`messages/${_id}`, {
      isRead: true,
      unreadActivitiesCount: 0
    })
  }

  markAllAsRead(type: string): Promise<{}> {
    return this.fetch.put(`messages/markallread`, {
      type: type
    })
  }

  snooze(_id: string, date: string): Promise<SnoozeResponse> {
    return this.fetch.put(`messages/${_id}/later`, {
      isLater: true,
      reminderDate: date
    })
  }

  delete(_id: string): Promise<{}> {
    return this.fetch.delete(`messages/${_id}`)
  }

  deleteAllRead(type: string): Promise<{}> {
    return this.fetch.delete(`messages?type=${type}`)
  }
}

export default new MessageFetch()
