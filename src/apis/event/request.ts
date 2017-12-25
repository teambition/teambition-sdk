import { Observable } from 'rxjs/Observable'
import { SDKFetch } from '../../SDKFetch'
import { EventSchema } from '../../schemas/Event'
import { EventId, ProjectId, UserId } from 'teambition-types'
import { api as eventAPI } from './iface'
import { API } from '../iface'

export namespace CommentsRepeatEvent {
  export interface Response {
    new: EventSchema
    repeat: EventSchema
    /**
     * TODO
     * Activity 接入 SDK 之后需要调整这里的代码
     */
    comment: any
  }

  export interface Options {
    action: 'comment'
    _creatorId: UserId
    content: 'string'
    timestamp: number
    attachments?: any[]
    mentions?: any[]
  }

  export const api: Pick<API<Response>, 'parse'> = {
    parse: (raw) => Object.assign(raw, {
      new: eventAPI.parse(raw.new),
      repeat: eventAPI.parse(raw.repeat)
    })
  }
}

export function commentsRepeatEvent(
  this: SDKFetch,
  _id: EventId,
  options: CommentsRepeatEvent.Options
): Observable<CommentsRepeatEvent.Response> {
  return this.post<CommentsRepeatEvent.Response>(`events/${_id}/comments_repeat_event`, options)
    .map(CommentsRepeatEvent.api.parse)
}

export namespace UpdateInvolveMembers {
  export type Payload = {
    addInvolvers: UserId[],
    delInvolvers: UserId[]
  }

  export interface Response {
    _id: EventId,
    involveMembers: UserId[],
    updated: string
  }
}

export function updateInvolveMembers(
  this: SDKFetch,
  eventId: EventId,
  payload: Partial<UpdateInvolveMembers.Payload>
): Observable<UpdateInvolveMembers.Response> {
  return this.put<UpdateInvolveMembers.Response>(`events/${eventId}/involveMembers`, payload)
}

export type EventSpan = { startDate: string, endDate?: string }

export interface EventCount {
  month: string,
  count: number
}

export function fetchAnEvent(
  this: SDKFetch,
  eventId: EventId,
  query?: any
): Observable<EventSchema> {
  return this.get<EventSchema>(`events/${eventId}`, query)
    .map(eventAPI.parse)
}

export function fetchProjectEventsCount(
  this: SDKFetch,
  _projectId: ProjectId,
  query: { endDate: string }
): Observable<EventCount[]> {
  return this.get<EventCount[]>(`projects/${_projectId}/events_count`, query)
}

export function fetchProjectEvents(
  this: SDKFetch,
  _projectId: ProjectId,
  query: EventSpan
): Observable<EventSchema[]> {
  return this.get<EventSchema[]>(`projects/${_projectId}/events`, query)
    .map((rawEvents) => rawEvents.map(eventAPI.parse))
}

SDKFetch.prototype.commentsRepeatEvent = commentsRepeatEvent
SDKFetch.prototype.updateEventInvolveMembers = updateInvolveMembers
SDKFetch.prototype.getEvent = fetchAnEvent
SDKFetch.prototype.getProjectEvents = fetchProjectEvents
SDKFetch.prototype.getProjectEventsCount = fetchProjectEventsCount

declare module '../../SDKFetch' {
  interface SDKFetch { // tslint:disable-line:no-shadowed-variable
    commentsRepeatEvent: typeof commentsRepeatEvent
    updateEventInvolveMembers: typeof updateInvolveMembers
    getEvent: typeof fetchAnEvent
    getProjectEvents: typeof fetchProjectEvents
    getProjectEventsCount: typeof fetchProjectEventsCount
  }
}
