'use strict'
import { Observable } from 'rxjs/Observable'
import { MessageData } from '../schemas/Message'
import MessageModel from '../models/MessageModel'
import {
  default as MessageFetch,
  GetMessageOptions,
  GetMessageType,
  ReadResponse,
  SnoozeResponse
} from '../fetchs/MessageFetch'
import { makeColdSignal } from './utils'
import { MessageId } from '../teambition'

export class MessageAPI {
  getMessages(query?: GetMessageOptions): Observable<MessageData[]> {
    return makeColdSignal<MessageData[]>(() => {
      const page = query && query.page ? query.page : 1
      const type: GetMessageType = query && query.type ? query.type : 'all'
      const get = MessageModel.getMessages(type, page)
      if (get) {
        return get
      }
      return MessageFetch.getMessages(query)
        .concatMap(messages => MessageModel.addMessages(type, messages, page))
    })
  }

  read(messageId: MessageId): Observable<ReadResponse> {
    return MessageFetch.read(messageId)
      .concatMap(message => MessageModel.update(<string>messageId, message))
  }

  markAllAsRead(type: GetMessageType): Observable<MessageData[]> {
    return MessageFetch.markAllAsRead(type)
      .concatMap(x => MessageModel.markAllAsRead(type))
  }

  snooze(messageId: MessageId, date: string): Observable<SnoozeResponse> {
    return MessageFetch.snooze(messageId, date)
      .concatMap(message => MessageModel.update(<string>messageId, message))
  }

  delete(messageId: MessageId): Observable<void> {
    return MessageFetch.delete(messageId)
      .concatMap(x => MessageModel.delete(<string>messageId))
  }

  deleteAllRead(type: GetMessageType): Observable<MessageData[]> {
    return MessageFetch.deleteAllRead(type)
      .concatMap(x => MessageModel.deleteAllRead(type))
  }
}

export default new MessageAPI
