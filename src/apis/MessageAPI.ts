'use strict'
import { Observable } from 'rxjs/Observable'
import { Observer } from 'rxjs/Observer'
import { MessageData } from '../schemas/Message'
import MessageModel from '../models/MessageModel'
import {
  default as MessageFetch,
  GetMessageOptions,
  ReadResponse,
  SnoozeResponse
} from '../fetchs/MessageFetch'
import { makeColdSignal, observableError, errorHandler } from './utils'

export class MessageAPI {
  constructor() {
    MessageModel.destructor()
  }

  getMessages(query?: GetMessageOptions): Observable<MessageData[]> {
    return makeColdSignal<MessageData[]>(observer => {
      const page = query && query.page ? query.page : 1
      const type = query && query.type ? query.type : 'all'
      const get = MessageModel.getMessages(type, page)
      if (get) {
        return get
      }
      return Observable.fromPromise(MessageFetch.getMessages(query))
        .catch(err => errorHandler(observer, err))
        .concatMap(messages => MessageModel.addMessages(type, messages, page))
    })
  }

  read(messageId: string): Observable<ReadResponse> {
    return Observable.create((observer: Observer<ReadResponse>) => {
      Observable.fromPromise(MessageFetch.read(messageId))
        .catch(err => observableError(observer, err))
        .concatMap(message => MessageModel.update(messageId, message))
        .forEach(message => observer.next(message))
        .then(x => observer.complete())
    })
  }

  markAllAsRead(type: string): Observable<void> {
    return Observable.create((observer: Observer<void>) => {
      Observable.fromPromise(MessageFetch.markAllAsRead(type))
        .catch(err => observableError(observer, err))
        .concatMap(x => MessageModel.markAllAsRead(type))
        .forEach(x => observer.next(null))
        .then(x => observer.complete())
    })
  }

  snooze(messageId: string, date: string): Observable<SnoozeResponse> {
    return Observable.create((observer: Observer<SnoozeResponse>) => {
      Observable.fromPromise(MessageFetch.snooze(messageId, date))
        .catch(err => observableError(observer, err))
        .concatMap(message => MessageModel.update(messageId, message))
        .forEach(message => observer.next(message))
        .then(x => observer.complete())
    })
  }

  delete(messageId: string): Observable<void> {
    return Observable.create((observer: Observer<void>) => {
      Observable.fromPromise(MessageFetch.delete(messageId))
        .catch(err => observableError(observer, err))
        .concatMap(x => MessageModel.delete(messageId))
        .forEach(x => observer.next(null))
        .then(x => observer.complete())
    })
  }

  deleteAllRead(type: string): Observable<void> {
    return Observable.create((observer: Observer<void>) => {
      Observable.fromPromise(MessageFetch.deleteAllRead(type))
        .catch(err => observableError(observer, err))
        .concatMap(x => MessageModel.deleteAllRead(type))
        .forEach(x => observer.next(null))
        .then(x => observer.complete())
    })
  }
}
