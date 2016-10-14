'use strict'
import { Observable } from 'rxjs/Observable'
import { MessageData } from '../schemas/Message'
import MessageModel from '../models/MessageModel'
import {
  default as MessageFetch,
  GetMessageOptions,
  ReadResponse,
  SnoozeResponse
} from '../fetchs/MessageFetch'
import { makeColdSignal } from './utils'

export class MessageAPI {
  getMessages(query?: GetMessageOptions): Observable<MessageData[]> {
    return makeColdSignal<MessageData[]>(() => {
      const page = query && query.page ? query.page : 1
      const type = query && query.type ? query.type : 'all'
      const get = MessageModel.getMessages(type, page)
      if (get) {
        return get
      }
      return MessageFetch.getMessages(query)
        .concatMap(messages => MessageModel.addMessages(type, messages, page))
    })
  }

  read(messageId: string): Observable<ReadResponse> {
    return MessageFetch.read(messageId)
      .concatMap(message => MessageModel.update(messageId, message))
  }

  markAllAsRead(type: string): Observable<MessageData[]> {
    return MessageFetch.markAllAsRead(type)
      .concatMap(x => MessageModel.markAllAsRead(type))
  }

  snooze(messageId: string, date: string): Observable<SnoozeResponse> {
    return MessageFetch.snooze(messageId, date)
      .concatMap(message => MessageModel.update(messageId, message))
  }

  delete(messageId: string): Observable<void> {
    return MessageFetch.delete(messageId)
      .concatMap(x => MessageModel.delete(messageId))
  }

  deleteAllRead(type: string): Observable<MessageData[]> {
    return MessageFetch.deleteAllRead(type)
      .concatMap(x => MessageModel.deleteAllRead(type))
  }
}

export default new MessageAPI
