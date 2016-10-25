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
import { EventId, UserId, ProjectId, TagId } from '../teambition'

export class EventAPI {
  create(option: CreateEventOptions): Observable<EventData> {
    return EventFetch.create(option)
      .concatMap(r => EventModel.addOne(r).take(1))
  }

  get(eventId: EventId, query?: any): Observable<TRecurrenceEvent> {
    // 不是 mongodb id
    let date: Date
    if (eventId.length > 24) {
      const idAndDate = eventId.split('&')
      eventId = <any>idAndDate[0]
      date = new Date(idAndDate[1])
    }
    return Observable.create((observer: Observer<Observable<EventData>>) => {
      let dest: Observable<EventData | void | TRecurrenceEvent> = EventModel.get(eventId)
      if (!dest || !EventModel.checkSchema(<any>eventId)) {
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

  update(eventId: EventId, query: UpdateEventOptions): Observable<any> {
    return EventFetch.update(eventId, query)
      .concatMap(x => EventModel.update(<any>eventId, x))
  }

  delete(eventId: EventId): Observable<void> {
    return EventFetch.delete(eventId)
      .concatMap(x => EventModel.delete(<any>eventId))
  }

  archive(eventId: EventId, occurrenceDate: number): Observable<ArchiveEventResponse> {
    return EventFetch.archive(eventId, occurrenceDate)
      .concatMap(x => EventModel.update(<any>eventId, x))
  }

  commentsRepeatEvent(eventId: EventId, commentBody: CommentBody): Observable<CommentRepeatResponse> {
    return EventFetch.commentsRepeatEvent(eventId, commentBody)
      .concatMap(x => EventModel.addOne(x.new).take(1).map(() => x))
      .concatMap((x: CommentRepeatResponse) => EventModel.update<EventData>(<any>eventId, x.repeat).map(() => x))
  }

  likeRepeatEvent(eventId: EventId, occurrenceDate: number): Observable<LikeRepeatEventResponse> {
    return EventFetch.likeRepeatEvent(eventId, occurrenceDate)
      .concatMap(x => EventModel.addOne(x.new).take(1).map(() => x))
      .concatMap((x: LikeRepeatEventResponse) => EventModel.update<EventData>(<any>eventId, x.repeat).map(() => x))
  }

  unarchive(eventId: EventId): Observable<UnarchiveEventResponse> {
    return EventFetch.unarchive(eventId)
      .concatMap(x => EventModel.update(<any>eventId, x))
  }

  updateContent(eventId: EventId, content: string, occurrenceDate?: number): Observable<UpdateEventContentResponse> {
    return EventFetch.updateContent(eventId, content, occurrenceDate)
      .concatMap(x => EventModel.update(<any>eventId, x))
  }

  updateInvolvemembers(eventId: EventId, options: UpdateEventInvolvesOptions): Observable<UpdateEventInvolvesResponse> {
    return EventFetch.updateInvolvemembers(eventId, options)
      .concatMap(x => EventModel.update(<any>eventId, x))
  }

  updateReminders(eventId: EventId, reminders: EventReminder[], occurrenceDate?: number): Observable<UpdateEventReminderResponse> {
    return EventFetch.updateReminders(eventId, reminders)
      .concatMap(x => EventModel.update(<any>eventId, x))
  }

  updateTags(eventId: EventId, tagIds: TagId[], occurrenceDate?: number): Observable<UpdateEventTagsResponse> {
    return EventFetch.updateTags(eventId, tagIds, occurrenceDate)
      .concatMap(x => EventModel.update(<any>eventId, x))
  }

  getProjectEvents(projectId: ProjectId, startDate: Date, endDate: Date | 'feature' = 'feature'): Observable<TRecurrenceEvent[]> {
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

  getMyEvents(userId: UserId, endDate: Date, query?: any): Observable<TRecurrenceEvent[]> {
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
