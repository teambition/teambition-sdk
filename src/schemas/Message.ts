import { SchemaDef, RDBType } from 'reactivedb/interface'
import { schemaColl } from './schemas'
import {
  MessageId,
  UserId,
  ProjectId,
  GroupId,
  ActivityId,
  DetailObjectId,
  DetailObjectType,
  ExecutorOrCreator
} from 'teambition-types'

export type MessageType = 'object#room' | 'object#task' | 'object#event' | 'object#post'

export interface MessageSchema {
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
  creator?: ExecutorOrCreator
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
  _groupId?: GroupId
  group?: {
    _id: GroupId
    name: string
    logo: string
  }
  _objectId: DetailObjectId | ProjectId
  objectType: DetailObjectType | 'activity' | 'room'
  mentions?: any  // deprecated
}

const schema: SchemaDef<MessageSchema> = {
  _id: {
    type: RDBType.STRING,
    primaryKey: true
  },
  _userId: {
    type: RDBType.STRING
  },
  type: {
    type: RDBType.STRING
  },
  updated: {
    type: RDBType.STRING
  },
  created: {
    type: RDBType.STRING
  },
  isArchived: {
    type: RDBType.BOOLEAN
  },
  isMute: {
    type: RDBType.BOOLEAN
  },
  isAted: {
    type: RDBType.BOOLEAN
  },
  reminder: {
    type: RDBType.OBJECT
  },
  isLater: {
    type: RDBType.BOOLEAN
  },
  isRead: {
    type: RDBType.BOOLEAN
  },
  unreadActivitiesCount: {
    type: RDBType.NUMBER
  },
  boundToObjectUpdated: {
    type: RDBType.DATE_TIME
  },
  creator: {
    type: RDBType.OBJECT
  },
  title: {
    type: RDBType.STRING
  },
  subtitle: {
    type: RDBType.STRING
  },
  _latestActivityId: {
    type: RDBType.STRING
  },
  latestActivityAction: {
    type: RDBType.STRING
  },
  _projectId: {
    type: RDBType.STRING
  },
  project: {
    type: RDBType.OBJECT
  },
  _groupId: {
    type: RDBType.STRING
  },
  group: {
    type: RDBType.OBJECT
  },
  _objectId: {
    type: RDBType.STRING
  },
  objectType: {
    type: RDBType.STRING
  }
}

schemaColl.add({ schema, name: 'Message' })
