import { SchemaDef, Relationship, RDBType } from 'reactivedb/interface'
import { schemas } from '../SDK'
import {
  ExecutorOrCreator,
  ObjectLinkId,
  UserId,
  DetailObjectId
} from 'teambition-types'

// 下列任意两个类型（或同类型）的数据可以互相链接
export type ParentType = 'task' | 'post' | 'event' | 'work' | 'collection' | 'entry'

export interface ObjectLinkSchema {
  _id: ObjectLinkId
  _creatorId: UserId
  _parentId: DetailObjectId
  parentType: ParentType
  parent: any
  _linkedId: DetailObjectId
  linkedType: ParentType
  linked: any
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
      name: 'User',
      where: (userTable: any) => ({
        _creatorId: userTable._id
      })
    }
  },
  data: {
    type: RDBType.OBJECT
  },
  linked: {
    type: RDBType.OBJECT
  },
  linkedType: {
    type: RDBType.STRING
  },
  parent: {
    type: RDBType.OBJECT
  },
  parentType: {
    type: RDBType.STRING
  },
  title: {
    type: RDBType.STRING
  }
}

schemas.push({ schema, name: 'ObjectLink' })
