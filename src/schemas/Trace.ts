import { TraceId, DetailObjectId, DetailObjectType, UserSnippet, UserId } from 'teambition-types'
import { SchemaDef, RDBType, Relationship } from '../db'
import { schemaColl } from './schemas'
import { FileSchema } from './File'

export interface TraceSchema {
  _boundToObjectId: DetailObjectId
  _creatorId: UserId
  _id: TraceId
  attachments: FileSchema[]
  boundToObjectType: DetailObjectType
  content: string
  created: string
  creator: UserSnippet
  raw: string
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
  raw: {
    type: RDBType.STRING,
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
