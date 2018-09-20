import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { SDKFetch } from '../../SDKFetch'
import { EventSchema } from '../../schemas/Event'
import { EventId, ProjectId, UserId } from 'teambition-types'
import { marshaler as eventMarshaler } from './marshaler'
import { Marshaler } from '../marshaler'

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

  export const api: Pick<Marshaler<Response>, 'parse'> = {
    parse: (raw) => ({
      ...raw as Response,
      new: eventMarshaler.parse(raw.new),
      repeat: eventMarshaler.parse(raw.repeat)
    })
  }
}

export function commentsRepeatEvent(
  this: SDKFetch,
  _id: EventId,
  options: CommentsRepeatEvent.Options
): Observable<CommentsRepeatEvent.Response> {
  return this.post<CommentsRepeatEvent.Response>(`events/${_id}/comments_repeat_event`, options)
    .pipe(map(CommentsRepeatEvent.api.parse))
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
    .pipe(map(eventMarshaler.parse))
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
    .pipe(map((rawEvents) => rawEvents.map(eventMarshaler.parse)))
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
