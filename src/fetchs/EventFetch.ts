'use strict'
import BaseFetch from './BaseFetch'
import { visibility } from '../teambition'
import { EventData } from '../schemas/Event'
import { ActivityData } from '../schemas/Activity'

export interface CreateEventOptions {
  _projectId: string
  title: string
  startDate: string
  endDate: string
  location?: string
  involveMembers?: string[]
  content?: string
  recurrence?: string[]
  reminders?: string[]
  visiable?: visibility
  tagIds?: string[]
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

export interface ArchiveEventResponse {
  isArchived: boolean
  updated: string
  _id: string
  _projectId: string
}

export interface CommentBody {
  action: 'comment'
  _creatorId: string
  attachments: string[]
  mentions: any
  timestamp: number
}

export interface FavoriteEventResponse {
  _creatorId: string
  _id: string
  _refId: string
  created: string
  data: EventData
  isFavorite: boolean
  isUpdated: boolean
  isVisible: boolean
  refType: 'task' | 'event' | 'post' | 'file'
  updated: string
}

export interface LikeEventResponse {
  isLike: boolean
  likesCount: number
  likesGroup: {
    _id: string
    name: string
  }[]
}

export interface LikeRepeatEventResponse {
  new: EventData
  repeat: EventData
  like: {
    isLike: boolean
    likesCount: number
    likesGroup: {
      _id: string
      name: string
    }[]
  }
}

export interface UnarchiveEventResponse {
  isArchived: boolean
  updated: string
  _id: string
  _projectId: string
}

export interface UpdateEventContentResponse {
  _id: string
  content: string
  updated: string
}

export type UpdateEventInvolvesOptions = {
  involveMembers: string[]
  occurrenceDate?: number
} | {
  addInvolvers?: string[]
  delInvolvers?: string[]
  occurrenceDate?: number
}

export interface UpdateEventInvolvesResponse {
  _id: string
  involveMembers: string[]
  updated: string
}

export interface EventReminder {
  method: 'popup' | 'sms' | 'email'
  minutes: number
}

export interface UpdateEventReminderResponse {
  _id: string
  reminders: EventReminder[]
}

export interface UpdateEventTagsResponse {
  tagIds: string[]
  _id: string
  updated: string
}

export interface CommentRepeatResponse {
  new: EventData
  repeat: EventData
  comment: ActivityData
}

export class EventFetch extends BaseFetch {
  create(options: CreateEventOptions): Promise<EventData> {
    return this.fetch.post(`events`, options)
  }

  get(eventId: string, query?: any): Promise<EventData> {
    return this.fetch.get(`events/${eventId}`, query)
  }

  update(eventId: string, query: UpdateEventOptions): Promise<any> {
    return this.fetch.put(`events/${eventId}`, query)
  }

  delete(eventId: string): Promise<void> {
    return this.fetch.delete<void>(`events/${eventId}`)
  }

  archive(eventId: string, occurrenceDate: number): Promise<ArchiveEventResponse> {
    return this.fetch.post(`events/${eventId}/archive`, {
      occurrenceDate: occurrenceDate
    })
  }

  commentsRepeatEvent(eventId: string, commentBody: CommentBody): Promise<CommentRepeatResponse> {
    return this.fetch.post(`events/${eventId}/comments_repeat_event`, commentBody)
  }

  like(eventId: string): Promise<LikeEventResponse> {
    return this.fetch.post(`events/${eventId}/like`)
  }

  likeRepeatEvent(eventId: string, occurrenceDate: number): Promise<LikeRepeatEventResponse> {
    return this.fetch.post(`events/${eventId}/like_repeat_event`, { occurrenceDate })
  }

  unarchive(eventId: string): Promise<UnarchiveEventResponse> {
    return this.fetch.delete(`events/${eventId}/archive`)
  }

  updateContent(eventId: string, content: string, occurrenceDate?: number): Promise<UpdateEventContentResponse> {
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

  updateInvolvemembers(eventId: string, options: UpdateEventInvolvesOptions): Promise<UpdateEventInvolvesResponse> {
    return this.fetch.put(`events/${eventId}/involveMembers`, options)
  }

  updateReminders(eventId: string, reminders: EventReminder[], occurrenceDate?: number): Promise<UpdateEventReminderResponse> {
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

  updateTags(eventId: string, tagIds: string[], occurrenceDate?: number): Promise<UpdateEventTagsResponse> {
    const body: {
      tagIds: string[]
      occurrenceDate?: number
    } = {
      tagIds
    }
    if (occurrenceDate) {
      body.occurrenceDate = occurrenceDate
    }
    return this.fetch.put(`events/${eventId}/tagIds`, body)
  }
}

export default new EventFetch()
