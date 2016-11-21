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
  UpdateEventTagsResponse,
  MoveEventResponse
} from '../fetchs/EventFetch'
import EventModel from '../models/EventModel'
import { TRecurrenceEvent } from '../models/events/RecurrenceEvent'
import { EventData } from '../schemas/Event'
import { EventId, ProjectId, TagId } from '../teambition'

export class EventAPI {
  create(option: CreateEventOptions): Observable<EventData> {
    return EventFetch.create(option)
      .concatMap(r =>
        EventModel.addOne(r)
          .take(1)
      )
  }

  get(eventId: EventId, query?: any): Observable<TRecurrenceEvent> {
    // 不是 mongodb id
    let date: Date
    if (eventId.length > 24) {
      const idAndDate = eventId.split('&')
      eventId = <string>idAndDate[0]
      date = new Date(idAndDate[1])
    }
    return Observable.create((observer: Observer<Observable<EventData>>) => {
      let dest: Observable<EventData | void | TRecurrenceEvent> = EventModel.get(eventId)
      if (!dest || !EventModel.checkSchema(<string>eventId)) {
        dest = EventFetch.get(eventId, query)
          .concatMap(x =>
            EventModel.addOne(x)
          )
      }
      dest = dest.map((x: TRecurrenceEvent) => {
        if (x && date) {
          const result = x.takeByTime(date)
          if (result) {
            return result
          } else {
            const result = EventModel.getByAlias(eventId + date.toISOString())
            return observer.next(result || Observable.of(null)) // 无效日期 result 为空
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
      .concatMap(x =>
        EventModel.update(<string>eventId, x)
      )
  }

  delete(eventId: EventId): Observable<void> {
    return EventFetch.delete(eventId)
      .concatMap(x =>
        EventModel.delete(<string>eventId)
      )
  }

  archive(eventId: EventId, occurrenceDate: number): Observable<ArchiveEventResponse> {
    return EventFetch.archive(eventId, occurrenceDate)
      .concatMap(x =>
        EventModel.update(<string>eventId, x)
      )
  }

  commentsRepeatEvent(eventId: EventId, commentBody: CommentBody): Observable<CommentRepeatResponse> {
    return EventFetch.commentsRepeatEvent(eventId, commentBody)
      .concatMap(x =>
        EventModel.addOne(x.new)
          .take(1)
          .mapTo(x)
      )
      .concatMap((x: CommentRepeatResponse) =>
        EventModel.update<EventData>(<string>eventId, x.repeat)
          .mapTo(x)
      )
  }

  likeRepeatEvent(eventId: EventId, occurrenceDate: number): Observable<LikeRepeatEventResponse> {
    return EventFetch.likeRepeatEvent(eventId, occurrenceDate)
      .concatMap(x =>
        EventModel.addOne(x.new)
          .take(1)
          .mapTo(x)
        )
      .concatMap((x: LikeRepeatEventResponse) =>
        EventModel.update<EventData>(<string>eventId, x.repeat)
          .mapTo(x)
      )
  }

  unarchive(eventId: EventId): Observable<UnarchiveEventResponse> {
    return EventFetch.unarchive(eventId)
      .concatMap(x =>
        EventModel.update(<string>eventId, x)
      )
  }

  updateContent(eventId: EventId, content: string, occurrenceDate?: number): Observable<UpdateEventContentResponse> {
    return EventFetch.updateContent(eventId, content, occurrenceDate)
      .concatMap(x =>
        EventModel.update(<string>eventId, x)
      )
  }

  updateInvolvemembers(eventId: EventId, options: UpdateEventInvolvesOptions): Observable<UpdateEventInvolvesResponse> {
    return EventFetch.updateInvolvemembers(eventId, options)
      .concatMap(x =>
        EventModel.update(<string>eventId, x)
      )
  }

  updateReminders(eventId: EventId, reminders: EventReminder[], occurrenceDate?: number): Observable<UpdateEventReminderResponse> {
    return EventFetch.updateReminders(eventId, reminders)
      .concatMap(x =>
        EventModel.update(<string>eventId, x)
      )
  }

  updateTags(eventId: EventId, tagIds: TagId[], occurrenceDate?: number): Observable<UpdateEventTagsResponse> {
    return EventFetch.updateTags(eventId, tagIds, occurrenceDate)
      .concatMap(x =>
        EventModel.update(<string>eventId, x)
      )
  }

  getProjectEvents(projectId: ProjectId, startDate: Date, endDate: Date | 'feature' = 'feature'): Observable<TRecurrenceEvent[]> {
    return Observable.create((observer: Observer<Observable<EventData[]>>) => {
      let dest: Observable<EventData[]>
      const cache = EventModel.getProjectEvents(projectId, startDate, endDate)
      if (cache) {
        dest = cache
      } else {
        dest = EventFetch.getProjectEvents(projectId, startDate, endDate)
          .concatMap(r =>
            EventModel.addProjectEvents(projectId, r, startDate, endDate)
          )
      }
      observer.next(dest)
    })
      ._switch()
  }

  move(eventId: EventId, projectId: ProjectId): Observable<MoveEventResponse> {
    return EventFetch.move(eventId, projectId)
      .concatMap(event =>
        EventModel.update(<string>eventId, event)
      )
  }

  fork(eventId: EventId, projectId: ProjectId): Observable<EventData> {
    return EventFetch.fork(eventId, projectId)
      .concatMap(event =>
        EventModel.addOne(event)
          .take(1)
      )
  }
}

export default new EventAPI
