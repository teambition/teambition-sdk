import { Observable } from '../../rx'
import { SDKFetch } from '../../SDKFetch'
import { ActivitySchema, RoomSchema } from '../../schemas'
import { RoomId } from 'teambition-types'

export interface CreateChatMessageOptions {
  attachments: any
  boundToObjectType: string
  content: string
  created: string
  mentions: object
  objectType: string
  updated: string
  _boundToObjectId: string
  _creatorId: string
}

export function createChatMessageFetch(
  this: SDKFetch,
  roomId: RoomId,
  options: CreateChatMessageOptions
): Observable<ActivitySchema> {
  return this.post<ActivitySchema>(`rooms/${roomId}/activities`, options)
}

// _TODO: 令参数 modelId 的类型匹配参数 type
export function getRoomInfoFetch(
  this: SDKFetch,
  type: string,
  modelId: string,
  query?: any
): Observable<RoomSchema> {
  return this.get<RoomSchema>(`rooms/${type}/${modelId}`, query)
}

export function getRoomActivitiesFetch(
  this: SDKFetch,
  roomId: RoomId,
  query?: any
): Observable<ActivitySchema> {
  return this.get<ActivitySchema>(`rooms/${roomId}/activities`, query)
}

export function getMoreRoomActivitiesFetch(
  this: SDKFetch,
  roomId: RoomId,
  query?: any
): Observable<ActivitySchema> {
  return this.get<ActivitySchema>(`rooms/${roomId}/activities`, query)
}

export namespace MarkMute {
  export interface IsMute {
    isMute: boolean
  }
}

export function markRoomMute(
  this: SDKFetch,
  roomId: RoomId,
  options: MarkMute.IsMute
): Observable<MarkMute.IsMute> {
  return this.put<MarkMute.IsMute>(`rooms/${roomId}/mute`, options)
}

export namespace MarkRead {
  export interface Response {
    isAted: boolean
    isRead: boolean
    msgType: string
    unreadActivitiesCount: number
    updated: string
  }
}

export function markRoomRead(
  this: SDKFetch,
  roomId: RoomId,
): Observable<MarkRead.Response> {
  return this.put<MarkRead.Response>(`rooms/${roomId}/message`)
}

SDKFetch.prototype.createChatMessage = createChatMessageFetch
SDKFetch.prototype.getRoomInfo = getRoomInfoFetch
SDKFetch.prototype.getRoomActivities = getRoomActivitiesFetch
SDKFetch.prototype.getMoreRoomActivities = getMoreRoomActivitiesFetch
SDKFetch.prototype.markRoomMute = markRoomMute
SDKFetch.prototype.markRoomRead = markRoomRead

declare module '../../SDKFetch' {
  interface SDKFetch { // tslint:disable-line no-shadowed-variable
    createChatMessage: typeof createChatMessageFetch
    getRoomInfo: typeof getRoomInfoFetch
    getRoomActivities: typeof getRoomActivitiesFetch
    getMoreRoomActivities: typeof getMoreRoomActivitiesFetch
    markRoomMute: typeof markRoomMute
    markRoomRead: typeof markRoomRead
  }
}
