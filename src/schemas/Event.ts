import { SchemaDef, RDBType, Relationship } from 'reactivedb/interface'
import { schemaColl } from './schemas'
import {
  Visibility,
  EventId,
  UserId,
  ProjectId,
  TagId,
  ExecutorOrCreator,
  ScenarioFieldConfigId,
  CustomFieldValue
} from 'teambition-types'

export interface EventSchema {
  _id: EventId
  _creatorId: UserId
  attachmentsCount: number
  title: string
  creator: ExecutorOrCreator
  involvers: any
  content: string
  commentsCount: number
  location: string
  startDate: string
  endDate: string
  untilDate: string
  involveMembers: string []
  _projectId: ProjectId
  _scenariofieldconfigId?: ScenarioFieldConfigId
  _sourceId: EventId
  sourceDate: string
  source?: string
  customfields?: CustomFieldValue[]
  shareStatus: number
  recurrence: string[]
  reminders: string[]
  isArchived: boolean
  visible: Visibility
  isDeleted: boolean
  created: string
  updated: string
  tagIds: TagId[]
  status: string
  isFavorite: boolean
  objectlinksCount: number
  likesCount: number
  project: {
    _id: ProjectId
    name: string
  }
  type: 'event'
  url: string
}

const schema: SchemaDef<EventSchema> = {
  _creatorId: {
    type: RDBType.STRING
  },
  _id: {
    type: RDBType.STRING,
    primaryKey: true
  },
  _projectId: {
    type: RDBType.STRING
  },
  _scenariofieldconfigId: {
    type: RDBType.STRING
  },
  _sourceId: {
    type: RDBType.STRING
  },
  attachmentsCount: {
    type: RDBType.NUMBER
  },
  commentsCount: {
    type: RDBType.NUMBER
  },
  content: {
    type: RDBType.STRING
  },
  created: {
    type: RDBType.DATE_TIME
  },
  creator: {
    type: Relationship.oneToOne,
    virtual: {
      name: 'User',
      where: (userTable: any) => ({
        _creatorId: userTable._id
      })
    }
  },
  customfields: {
    type: RDBType.OBJECT
  },
  endDate: {
    type: RDBType.DATE_TIME
  },
  involvers: {
    type: RDBType.OBJECT
  },
  involveMembers: {
    type: RDBType.LITERAL_ARRAY
  },
  isArchived: {
    type: RDBType.BOOLEAN
  },
  isDeleted: {
    type: RDBType.BOOLEAN
  },
  isFavorite: {
    type: RDBType.BOOLEAN
  },
  likesCount: {
    type: RDBType.NUMBER
  },
  location: {
    type: RDBType.STRING
  },
  objectlinksCount: {
    type: RDBType.NUMBER
  },
  project: {
    type: Relationship.oneToOne,
    virtual: {
      name: 'Project',
      where: (projectTable: any) => ({
        _projectId: projectTable._id
      })
    }
  },
  recurrence: {
    type: RDBType.OBJECT
  },
  reminders: {
    type: RDBType.OBJECT
  },
  shareStatus: {
    type: RDBType.NUMBER
  },
  source: {
    type: RDBType.STRING
  },
  sourceDate: {
    type: RDBType.DATE_TIME
  },
  startDate: {
    type: RDBType.DATE_TIME
  },
  status: {
    type: RDBType.STRING
  },
  tagIds: {
    type: RDBType.LITERAL_ARRAY
  },
  title: {
    type: RDBType.STRING
  },
  type: {
    type: RDBType.STRING
  },
  untilDate: {
    type: RDBType.DATE_TIME
  },
  updated: {
    type: RDBType.DATE_TIME
  },
  url: {
    type: RDBType.STRING
  },
  visible: {
    type: RDBType.STRING
  }
}

schemaColl.add({ schema, name: 'Event' })
