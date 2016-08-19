'use strict'
import { Schema, schemaName, ISchema, child } from './schema'
import { ExecutorOrCreator } from '../teambition'

export interface MessageData extends ISchema {
  _id: string
  _userId: string
  _projectId: string
  _organizationId?: string
  type: string
  updated: string
  isArchived: boolean
  isMute: boolean
  isAted: boolean
  reminder: {
    reminderDate: string
    updated: string
  }
  isLater: boolean
  isRead: boolean
  unreadActivitiesCount: number
  boundToObjectUpdated: string
  creator: ExecutorOrCreator
  title: string
  body?: string
  mentions?: {
    [index: string]: string
  }
  _latestActivityId: string
  subtitle: string
  project: {
    name: string
    logo: string
    _id: string
  }
  _objectId: string
  objectType: string
}

@schemaName('Message')
export default class Message extends Schema<MessageData> implements MessageData {
  _id: string = undefined
  _userId: string = undefined
  _projectId: string = undefined
  type: string = undefined
  updated: string = undefined
  isArchived: boolean = undefined
  isMute: boolean = undefined
  isAted: boolean = undefined
  reminder: {
    reminderDate: string
    updated: string
  } = undefined
  isLater: boolean = undefined
  isRead: boolean = undefined
  unreadActivitiesCount: number = undefined
  boundToObjectUpdated: string = undefined
  creator: ExecutorOrCreator = undefined
  title: string = undefined
  _latestActivityId: string = undefined
  subtitle: string = undefined
  @child('Object', 'Project') project: {
    name: string
    logo: string
    _id: string
  } = undefined
  _objectId: string = undefined
  objectType: string = undefined
}
