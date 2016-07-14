'use strict'
import { Observable } from 'rxjs/Observable'
import { Observer } from 'rxjs/Observer'
import {
  default as EventFetch,
  CreateEventOptions,
  UpdateEventOptions,
  ArchiveEventResponse,
  CommentBody,
  CommentRepeatResponse,
  LikeEventResponse,
  LikeRepeatEventResponse,
  UnarchiveEventResponse,
  UpdateEventContentResponse,
  UpdateEventInvolvesResponse,
  UpdateEventInvolvesOptions,
  EventReminder,
  UpdateEventReminderResponse,
  UpdateEventTagsResponse
} from '../fetchs/EventFetch'
import EventModel from '../models/EventModel'
import { EventData } from '../schemas/Event'
import { observableError, makeColdSignal, errorHandler } from './utils'

export class EventAPI {
  constructor() {
    EventModel.destructor()
  }

  create(option: CreateEventOptions): Observable<EventData> {
    return Observable.create((observer: Observer<EventData>) => {
      Observable.fromPromise(EventFetch.create(option))
        .catch(err => observableError(observer, err))
        .concatMap(r => EventModel.addOne(r).take(1))
        .forEach(r => observer.next(r))
        .then(() => observer.complete())
        .catch(e => observer.error(e))
    })
  }

  get(eventId: string, query?: any): Observable<EventData> {
    return makeColdSignal<EventData>(observer => {
      const cache = EventModel.get(eventId)
      if (cache && EventModel.checkSchema(eventId)) {
        return cache
      }
      return Observable.fromPromise(EventFetch.get(eventId, query))
        .catch(err => errorHandler(observer, err))
        .concatMap(x => EventModel.addOne(x))
    })
  }

  update(eventId: string, query: UpdateEventOptions): Observable<any> {
    return Observable.create((observer: Observer<UpdateEventOptions>) => {
      Observable.fromPromise(EventFetch.update(eventId, query))
        .catch(err => observableError(observer, err))
        .concatMap(x => EventModel.update(eventId, x))
        .forEach(x => observer.next(x))
        .then(() => observer.complete())
    })
  }

  delete(eventId: string): Observable<void> {
    return Observable.create((observer: Observer<void>) => {
      Observable.fromPromise(EventFetch.delete(eventId))
        .catch(err => observableError(observer, err))
        .concatMap(x => EventModel.delete(eventId))
        .forEach(() => observer.next(null))
        .then(() => observer.complete())
    })
  }

  archive(eventId: string, occurrenceDate: number): Observable<ArchiveEventResponse> {
    return Observable.create((observer: Observer<ArchiveEventResponse>) => {
      Observable.fromPromise(EventFetch.archive(eventId, occurrenceDate))
        .catch(err => observableError(observer, err))
        .concatMap(x => EventModel.update(eventId, x))
        .forEach(x => observer.next(x))
        .then(() => observer.complete())
    })
  }

  commentsRepeatEvent(eventId: string, commentBody: CommentBody): Observable<CommentRepeatResponse> {
    return Observable.create((observer: Observer<CommentRepeatResponse>) => {
      Observable.fromPromise(EventFetch.commentsRepeatEvent(eventId, commentBody))
        .catch(err => observableError(observer, err))
        .concatMap(x => EventModel.addOne(x.new).take(1).map(() => x))
        .forEach(x => observer.next(x))
        .then(() => observer.complete())
    })
  }

  like(eventId: string): Observable<LikeEventResponse> {
    return Observable.create((observer: Observer<LikeEventResponse>) => {
      Observable.fromPromise(EventFetch.like(eventId))
        .catch(err => observableError(observer, err))
        .concatMap(x => EventModel.update(eventId, x))
        .forEach(x => observer.next(x))
        .then(() => observer.complete())
    })
  }

  likeRepeatEvent(eventId: string, occurrenceDate: number): Observable<LikeRepeatEventResponse> {
    return Observable.create((observer: Observer<LikeRepeatEventResponse>) => {
      Observable.fromPromise(EventFetch.likeRepeatEvent(eventId, occurrenceDate))
        .catch(err => observableError(observer, err))
        .concatMap(x => EventModel.addOne(x.new).take(1).map(() => x))
        .forEach(x => observer.next(x))
        .then(() => observer.complete())
    })
  }

  unarchive(eventId: string): Observable<UnarchiveEventResponse> {
    return Observable.create((observer: Observer<UnarchiveEventResponse>) => {
      Observable.fromPromise(EventFetch.unarchive(eventId))
        .catch(err => observableError(observer, err))
        .concatMap(x => EventModel.update(eventId, x))
        .forEach(x => observer.next(x))
        .then(() => observer.complete())
    })
  }

  updateContent(eventId: string, content: string, occurrenceDate?: number): Observable<UpdateEventContentResponse> {
    return Observable.create((observer: Observer<UpdateEventContentResponse>) => {
      Observable.fromPromise(EventFetch.updateContent(eventId, content, occurrenceDate))
        .catch(err => observableError(observer, err))
        .concatMap(x => EventModel.update(eventId, x))
        .forEach(x => observer.next(x))
        .then(() => observer.complete())
    })
  }

  updateInvolvemembers(eventId: string, options: UpdateEventInvolvesOptions): Observable<UpdateEventInvolvesResponse> {
    return Observable.create((observer: Observer<UpdateEventInvolvesResponse>) => {
      Observable.fromPromise(EventFetch.updateInvolvemembers(eventId, options))
        .catch(err => observableError(observer, err))
        .concatMap(x => EventModel.update(eventId, x))
        .forEach(x => observer.next(x))
        .then(() => observer.complete())
    })
  }

  updateReminders(eventId: string, reminders: EventReminder[], occurrenceDate?: number): Observable<UpdateEventReminderResponse> {
    return Observable.create((observer: Observer<UpdateEventReminderResponse>) => {
      Observable.fromPromise(EventFetch.updateReminders(eventId, reminders))
        .catch(err => observableError(observer, err))
        .concatMap(x => EventModel.update(eventId, x))
        .forEach(x => observer.next(x))
        .then(() => observer.complete())
    })
  }

  updateTags(eventId: string, tagIds: string[], occurrenceDate?: number): Observable<UpdateEventTagsResponse> {
    return Observable.create((observer: Observer<UpdateEventTagsResponse>) => {
      Observable.fromPromise(EventFetch.updateTags(eventId, tagIds, occurrenceDate))
        .catch(err => observableError(observer, err))
        .concatMap(x => EventModel.update(eventId, x))
        .forEach(x => observer.next(x))
        .then(() => observer.complete())
    })
  }
}
