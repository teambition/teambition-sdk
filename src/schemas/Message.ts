'use strict'
import { Schema, schemaName, ISchema, child } from './schema'

export interface MessageData extends ISchema {
  _id: string
  _userId: string
  type: string
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
    _id: string
    name: string
    avatarUrl: string
    email?: string
  }
  title: string
  subtitle: string
  _latestActivityId?: string
  latestActivityAction?: string
  _projectId?: string
  project?: {
    _id: string
    name: string
    logo: string
  }
  _organizationId?: string
  organization?: {
    _id: string
    name: string
    logo: string
  }
  _objectId: string
  objectType: string
  mentions?: any  // deprecated
}

@schemaName('Message')
export default class Message extends Schema<MessageData> implements MessageData {
  _id: string = undefined
  _userId: string = undefined
  type: string = undefined
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
    _id: string
    name: string
    avatarUrl: string
  } = undefined
  title: string = undefined
  subtitle: string = undefined
  @child('Object', 'Project') project?: {
    _id: string
    name: string
    logo: string
  }
  @child('Object', 'Organization') organization?: {
    _id: string
    name: string
    logo: string
  }
  _objectId: string = undefined
  objectType: string = undefined
}
