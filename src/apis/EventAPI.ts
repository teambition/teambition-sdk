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

export class EventAPI {
  create(option: CreateEventOptions): Observable<EventData> {
    return EventFetch.create(option)
      .concatMap(r => EventModel.addOne(r).take(1))
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
        dest = EventFetch.get(eventId, query)
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
    return EventFetch.update(eventId, query)
      .concatMap(x => EventModel.update(eventId, x))
  }

  delete(eventId: string): Observable<void> {
    return EventFetch.delete(eventId)
      .concatMap(x => EventModel.delete(eventId))
  }

  archive(eventId: string, occurrenceDate: number): Observable<ArchiveEventResponse> {
    return EventFetch.archive(eventId, occurrenceDate)
      .concatMap(x => EventModel.update(eventId, x))
  }

  commentsRepeatEvent(eventId: string, commentBody: CommentBody): Observable<CommentRepeatResponse> {
    return EventFetch.commentsRepeatEvent(eventId, commentBody)
      .concatMap(x => EventModel.addOne(x.new).take(1).map(() => x))
      .concatMap((x: CommentRepeatResponse) => EventModel.update<EventData>(eventId, x.repeat).map(() => x))
  }

  likeRepeatEvent(eventId: string, occurrenceDate: number): Observable<LikeRepeatEventResponse> {
    return EventFetch.likeRepeatEvent(eventId, occurrenceDate)
      .concatMap(x => EventModel.addOne(x.new).take(1).map(() => x))
      .concatMap((x: LikeRepeatEventResponse) => EventModel.update<EventData>(eventId, x.repeat).map(() => x))
  }

  unarchive(eventId: string): Observable<UnarchiveEventResponse> {
    return EventFetch.unarchive(eventId)
      .concatMap(x => EventModel.update(eventId, x))
  }

  updateContent(eventId: string, content: string, occurrenceDate?: number): Observable<UpdateEventContentResponse> {
    return EventFetch.updateContent(eventId, content, occurrenceDate)
      .concatMap(x => EventModel.update(eventId, x))
  }

  updateInvolvemembers(eventId: string, options: UpdateEventInvolvesOptions): Observable<UpdateEventInvolvesResponse> {
    return EventFetch.updateInvolvemembers(eventId, options)
      .concatMap(x => EventModel.update(eventId, x))
  }

  updateReminders(eventId: string, reminders: EventReminder[], occurrenceDate?: number): Observable<UpdateEventReminderResponse> {
    return EventFetch.updateReminders(eventId, reminders)
      .concatMap(x => EventModel.update(eventId, x))
  }

  updateTags(eventId: string, tagIds: string[], occurrenceDate?: number): Observable<UpdateEventTagsResponse> {
    return EventFetch.updateTags(eventId, tagIds, occurrenceDate)
      .concatMap(x => EventModel.update(eventId, x))
  }

  getProjectEvents(projectId: string, startDate: Date, endDate: Date | 'feature' = 'feature'): Observable<TRecurrenceEvent[]> {
    return Observable.create((observer: Observer<Observable<EventData[]>>) => {
      let dest: Observable<EventData[]>
      const cache = EventModel.getProjectEvents(projectId, startDate, endDate)
      if (cache) {
        dest = cache
      } else {
        dest = EventFetch.getProjectEvents(projectId, startDate, endDate)
          .concatMap(r => EventModel.addProjectEvents(projectId, r, startDate, endDate))
      }
      observer.next(dest)
    })
      ._switch()
  }

  getMyEvents(userId: string, endDate: Date, query?: any): Observable<TRecurrenceEvent[]> {
    const signal: Observable<Observable<TRecurrenceEvent[]>> = Observable.create((observer: Observer<Observable<EventData[]>>) => {
      let dest: Observable<EventData[]>
      const cache = EventModel.getMyEvents(userId, endDate)
      if (cache) {
        dest = cache
      } else {
        dest = EventFetch.getMyEvents(endDate)
          .concatMap(r => EventModel.addMyEvents(userId, endDate, r))
      }
      observer.next(dest)
    })
    return signal._switch()
  }
}

export default new EventAPI
