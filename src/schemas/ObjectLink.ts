import { SchemaDef, Relationship, RDBType } from 'reactivedb/interface'
import { schemas } from '../SDK'
import {
  ExecutorOrCreator,
  ObjectLinkId,
  UserId,
  DetailObjectId
} from 'teambition-types'

export type ParentType = 'task' | 'post' | 'event' | 'work'

export interface ObjectLinkSchema {
  _id: ObjectLinkId
  _creatorId: UserId
  _parentId: DetailObjectId
  parentType: ParentType
  linkedType: ParentType
  _linkedId: DetailObjectId
  created: string
  creator: ExecutorOrCreator
  title: string
  data: any
}

const schema: SchemaDef<ObjectLinkSchema> = {
  _creatorId: {
    type: RDBType.STRING
  },
  _id: {
    type: RDBType.STRING,
    primaryKey: true
  },
  _linkedId: {
    type: RDBType.STRING
  },
  _parentId: {
    type: RDBType.STRING
  },
  created: {
    type: RDBType.DATE_TIME
  },
  creator: {
    type: Relationship.oneToOne,
    virtual: {
      name: 'Member',
      where: (memberTable: any) => ({
        _creatorId: memberTable._id
      })
    }
  },
  data: {
    type: RDBType.OBJECT
  },
  linkedType: {
    type: RDBType.STRING
  },
  parentType: {
    type: RDBType.STRING
  },
  title: {
    type: RDBType.STRING
  }
}

schemas.push({ schema, name: 'ObjectLink' })
