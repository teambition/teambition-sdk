import { TraceId, DetailObjectId, DetailObjectType, UserSnippet, UserId } from 'teambition-types'
import { SchemaDef, RDBType, Relationship } from '../db'
import { schemaColl } from './schemas'
import { FileSchema } from './File'

export interface TraceSchema {
  _boundToObjectId: DetailObjectId
  _creatorId: TraceId
  _id: TraceId
  activityCount: number
  attachments: FileSchema[]
  boundToObjectType: DetailObjectType
  content: string
  created: string
  creator: UserSnippet
  likeCount: number
  mentionIds: UserId[]
  objectType: 'trace'
  raw: string
  reminderIds: UserId[]
  renderMode: 'html'
  status: number
  title: string
  updated: string
}

const schema: SchemaDef<TraceSchema> = {
  _boundToObjectId: {
    type: RDBType.STRING
  },
  _creatorId: {
    type: RDBType.STRING
  },
  _id: {
    type: RDBType.STRING,
    primaryKey: true
  },
  activityCount: {
    type: RDBType.NUMBER,
  },
  attachments: {
    type: RDBType.OBJECT,
  },
  boundToObjectType: {
    type: RDBType.STRING,
  },
  content: {
    type: RDBType.STRING,
  },
  created: {
    type: RDBType.STRING,
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
  likeCount: {
    type: RDBType.NUMBER,
  },
  mentionIds: {
    type: RDBType.OBJECT,
  },
  objectType: {
    type: RDBType.STRING,
  },
  raw: {
    type: RDBType.STRING,
  },
  reminderIds: {
    type: RDBType.OBJECT,
  },
  renderMode: {
    type: RDBType.STRING,
  },
  status: {
    type: RDBType.NUMBER,
  },
  title: {
    type: RDBType.STRING,
  },
  updated: {
    type: RDBType.STRING,
  },
}

schemaColl.add({ schema, name: 'Trace' })
