'use strict'
import 'rxjs/add/operator/switch'
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
import { TRecurrenceEvent } from '../models/events/RecurrenceEvent'
import { EventData } from '../schemas/Event'
import { observableError, errorHandler } from './utils'

export class EventAPI {
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

  get(eventId: string, query?: any): Observable<TRecurrenceEvent> {
    // 不是 mongodb id
    let date: Date
    if (eventId.length > 24) {
      const idAndDate = eventId.split('&')
      eventId = idAndDate[0]
      date = new Date(idAndDate[1])
    }
    return Observable.create((observer: Observer<Observable<EventData>>) => {
      let dest: Observable<EventData | void | TRecurrenceEvent> = EventModel.get(eventId)
      if (!dest || !EventModel.checkSchema(eventId)) {
        dest = Observable.fromPromise(EventFetch.get(eventId, query))
          .catch(err => errorHandler(observer, err))
          .concatMap(x => EventModel.addOne(x))
      }
      dest = dest.map((x: TRecurrenceEvent) => {
        if (date) {
          const result = x.takeByTime(date)
          if (result) {
            return result
          } else {
            const result = EventModel.getByAlias(eventId + date.toISOString())
            return observer.next(result)
          }
        } else {
          return x
        }
      })
      observer.next(<any>dest)
    })
      ._switch()
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
        .concatMap((x: CommentRepeatResponse) => EventModel.update<EventData>(eventId, x.repeat).map(() => x))
        .forEach((x: CommentRepeatResponse) => observer.next(x))
        .then(() => observer.complete())
        .catch(e => observer.error(e))
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
        .concatMap((x: LikeRepeatEventResponse) => EventModel.update<EventData>(eventId, x.repeat).map(() => x))
        .forEach((x: LikeRepeatEventResponse) => observer.next(x))
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

  getProjectEvents(projectId: string, startDate: Date, endDate: Date | 'feature' = 'feature'): Observable<TRecurrenceEvent[]> {
    return Observable.create((observer: Observer<Observable<EventData[]>>) => {
      let dest: Observable<EventData[]>
      const cache = EventModel.getProjectEvents(projectId, startDate, endDate)
      if (cache) {
        dest = cache
      } else {
        dest = Observable.fromPromise(EventFetch.getProjectEvents(projectId, startDate, endDate))
          .catch(e => errorHandler(observer, e))
          .concatMap(r => EventModel.addProjectEvents(projectId, r, startDate, endDate))
      }

      observer.next(dest)
    })
      .concatMap((r: Observable<TRecurrenceEvent[]>) => r)
  }

  getMyEvents(userId: string, endDate: Date, query?: any): Observable<TRecurrenceEvent[]> {
    const signal: Observable<Observable<TRecurrenceEvent[]>> = Observable.create((observer: Observer<Observable<EventData[]>>) => {
      let dest: Observable<EventData[]>
      const cache = EventModel.getMyEvents(userId, endDate)
      if (cache) {
        dest = cache
      } else {
        dest = Observable.fromPromise(EventFetch.getMyEvents(endDate))
          .catch(e => errorHandler(observer, e))
          .concatMap(r => EventModel.addMyEvents(userId, endDate, r))
      }
      observer.next(dest)
    })
    return signal.switch()
  }
}
