'use strict'
import { Observable } from 'rxjs/Observable'
import BaseFetch from './BaseFetch'
import { visibility } from '../teambition'
import { EventData } from '../schemas/Event'
import { ActivityData } from '../schemas/Activity'
import { LikeData } from '../schemas/Like'
import { EventId, ProjectId, TagId, UserId } from '../teambition'

export interface CreateEventOptions {
  _projectId: ProjectId
  title: string
  startDate: string
  endDate: string
  location?: string
  involveMembers?: UserId[]
  content?: string
  recurrence?: string[]
  reminders?: string[]
  visiable?: visibility
  tagIds?: TagId[]
}

export interface UpdateEventOptions {
  title?: string
  location?: string
  startDate?: string
  endDate?: string
  content?: string
  recurrence?: string[]
  reminders?: string[]
  occurrenceDate?: string[]
}

export interface GetMyEventsOptions {
  startDate?: Date
  endDate?: Date
}

export interface ArchiveEventResponse {
  isArchived: boolean
  updated: string
  _id: EventId
  _projectId: ProjectId
}

export interface CommentBody {
  action: 'comment'
  _creatorId: UserId
  attachments: string[]
  mentions: any
  timestamp: number
}

export interface LikeRepeatEventResponse {
  new: EventData
  repeat: EventData
  like: LikeData
}

export interface UnarchiveEventResponse {
  isArchived: boolean
  updated: string
  _id: EventId
  _projectId: ProjectId
}

export interface UpdateEventContentResponse {
  _id: EventId
  content: string
  updated: string
}

export type UpdateEventInvolvesOptions = {
  involveMembers: UserId[]
  occurrenceDate?: number
} | {
  addInvolvers?: UserId[]
  delInvolvers?: UserId[]
  occurrenceDate?: number
}

export interface UpdateEventInvolvesResponse {
  _id: EventId
  involveMembers: UserId[]
  updated: string
}

export interface EventReminder {
  method: 'popup' | 'sms' | 'email'
  minutes: number
}

export interface UpdateEventReminderResponse {
  _id: EventId
  reminders: EventReminder[]
}

export interface UpdateEventTagsResponse {
  tagIds: TagId[]
  _id: EventId
  updated: string
}

export interface CommentRepeatResponse {
  new: EventData
  repeat: EventData
  comment: ActivityData
}

export interface MoveEventResponse {
  _id: string
  _projectId: string
  tagIds: string[]
  involveMembers: UserId[]
  updated: string
}

export interface MyEventsCount {
  month: string // YYYYMM
  count: number
}

export type MyEventsCountResponse = MyEventsCount[]

export class EventFetch extends BaseFetch {
  create(options: CreateEventOptions): Observable<EventData> {
    return this.fetch.post(`events`, options)
  }

  get(eventId: EventId, query?: any): Observable<EventData> {
    return this.fetch.get(`events/${eventId}`, query)
  }

   getByTagId(tagId: string, query?: any): Observable<EventData[]> {
    return this.fetch.get(`tags/${tagId}/events`, query)
  }

  update(eventId: EventId, query: UpdateEventOptions): Observable<any> {
    return this.fetch.put(`events/${eventId}`, query)
  }

  delete(eventId: EventId): Observable<void> {
    return this.fetch.delete<void>(`events/${eventId}`)
  }

  archive(eventId: EventId, occurrenceDate: number): Observable<ArchiveEventResponse> {
    return this.fetch.post(`events/${eventId}/archive`, {
      occurrenceDate: occurrenceDate
    })
  }

  commentsRepeatEvent(eventId: EventId, commentBody: CommentBody): Observable<CommentRepeatResponse> {
    return this.fetch.post(`events/${eventId}/comments_repeat_event`, commentBody)
  }

  likeRepeatEvent(eventId: EventId, occurrenceDate: number): Observable<LikeRepeatEventResponse> {
    return this.fetch.post(`events/${eventId}/like_repeat_event`, { occurrenceDate })
  }

  unarchive(eventId: EventId): Observable<UnarchiveEventResponse> {
    return this.fetch.delete(`events/${eventId}/archive`)
  }

  updateContent(eventId: EventId, content: string, occurrenceDate?: number): Observable<UpdateEventContentResponse> {
    const body: {
      content: string
      occurrenceDate?: number
    } = {
      content: content
    }
    if (occurrenceDate) {
      body.occurrenceDate = occurrenceDate
    }
    return this.fetch.put(`events/${eventId}/content`, body)
  }

  updateInvolvemembers(eventId: EventId, options: UpdateEventInvolvesOptions): Observable<UpdateEventInvolvesResponse> {
    return this.fetch.put(`events/${eventId}/involveMembers`, options)
  }

  updateReminders(eventId: EventId, reminders: EventReminder[], occurrenceDate?: number): Observable<UpdateEventReminderResponse> {
    const body: {
      reminders: EventReminder[]
      occurrenceDate?: number
    } = {
      reminders
    }
    if (occurrenceDate) {
      body.occurrenceDate = occurrenceDate
    }
    return this.fetch.put(`events/${eventId}/reminders`, body)
  }

  updateTags(eventId: EventId, tagIds: TagId[], occurrenceDate?: number): Observable<UpdateEventTagsResponse> {
    const body: {
      tagIds: TagId[]
      occurrenceDate?: number
    } = {
      tagIds
    }
    if (occurrenceDate) {
      body.occurrenceDate = occurrenceDate
    }
    return this.fetch.put(`events/${eventId}/tagIds`, body)
  }

  getProjectEvents(projectId: ProjectId, startDate: Date, endDate: Date | 'feature'): Observable<EventData[]> {
    let query: string
    if (endDate instanceof Date) {
      query = `&endDate=${endDate.toISOString()}`
    } else {
      query = ''
    }
    return this.fetch.get(`projects/${projectId}/events?startDate=${startDate.toISOString()}${query}`)
  }

  getMyEvents(options?: GetMyEventsOptions): Observable<EventData[]> {
    let query: any = {}
    if (options.startDate) {
      query.startDate = options.startDate.toISOString()
    }
    if (options.endDate) {
      query.endDate = options.endDate.toISOString()
    }
    return this.fetch.get(`events/me`, query)
  }

  getMyEventsCount(endDate: Date): Observable<MyEventsCountResponse> {
    let query: any = {
      endDate: endDate.toISOString()
    }
    return this.fetch.get('events/me/count/group-by', query)
  }

  move(eventId: EventId, projectId: ProjectId): Observable<MoveEventResponse> {
    return this.fetch.put(`events/${eventId}/move`, {
      _projectId: projectId
    })
  }

  fork(eventId: EventId, projectId: ProjectId): Observable<EventData> {
    return this.fetch.put(`events/${eventId}/fork`, {
      _projectId: projectId
    })
  }
}

export default new EventFetch
