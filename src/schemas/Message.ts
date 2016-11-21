'use strict'
import { Schema, schemaName, ISchema, child } from './schema'
import {
  MessageId,
  UserId,
  ProjectId,
  OrganizationId,
  ActivityId,
  DetailObjectId,
  DetailObjectTypes
} from '../teambition'

export type MessageType = 'object' | 'system'

export interface MessageData extends ISchema {
  _id: MessageId
  _userId: UserId
  type: MessageType
  updated: string
  created: string
  isArchived: boolean
  isMute: boolean
  isAted: boolean
  reminder?: {
    reminderDate: string
    updated: string
  }
  isLater: boolean
  isRead: boolean
  unreadActivitiesCount: number
  boundToObjectUpdated: string
  creator: {
    _id: UserId
    name: string
    avatarUrl: string
    email?: string
  }
  title: string
  subtitle: string
  _latestActivityId?: ActivityId
  latestActivityAction?: string
  _projectId?: ProjectId
  project?: {
    _id: ProjectId
    name: string
    logo: string
  }
  _organizationId?: OrganizationId
  organization?: {
    _id: OrganizationId
    name: string
    logo: string
  }
  _objectId: DetailObjectId | ProjectId
  objectType: DetailObjectTypes | 'activity' | 'room'
  mentions?: any  // deprecated
}

@schemaName('Message')
export default class Message extends Schema<MessageData> implements MessageData {
  _id: MessageId = undefined
  _userId: UserId = undefined
  type: MessageType = undefined
  updated: string = undefined
  created: string = undefined
  isArchived: boolean = undefined
  isMute: boolean = undefined
  isAted: boolean = undefined
  isLater: boolean = undefined
  isRead: boolean = undefined
  unreadActivitiesCount: number = undefined
  boundToObjectUpdated: string = undefined
  creator: {
    _id: UserId
    name: string
    avatarUrl: string
  } = undefined
  title: string = undefined
  subtitle: string = undefined
  @child('Object', 'Project') project?: {
    _id: ProjectId
    name: string
    logo: string
  }
  @child('Object', 'Organization') organization?: {
    _id: OrganizationId
    name: string
    logo: string
  }
  _objectId: DetailObjectId | ProjectId = undefined
  objectType: DetailObjectTypes | 'activity' | 'room' = undefined
}
