import { SchemaDef, RDBType } from 'reactivedb/interface'
import { schemaColl } from './schemas'
import { CollectionId, UserId } from 'teambition-types'

export interface CollectionSchema {
  _id: CollectionId
  title: string
  _projectId: string
  _creatorId: UserId
  _parentId: CollectionId
  collectionType: string
  description: string
  isArchived: boolean
  created: string
  updated: string
}

const schema: SchemaDef<CollectionSchema> = {
  _creatorId: {
    type: RDBType.STRING
  },
  _id: {
    type: RDBType.STRING,
    primaryKey: true
  },
  _parentId: {
    type: RDBType.STRING
  },
  _projectId: {
    type: RDBType.STRING
  },
  collectionType: {
    type: RDBType.STRING
  },
  created: {
    type: RDBType.DATE_TIME
  },
  description: {
    type: RDBType.STRING
  },
  isArchived: {
    type: RDBType.BOOLEAN
  },
  title: {
    type: RDBType.STRING
  },
  updated: {
    type: RDBType.STRING
  }
}

schemaColl.add({ schema, name: 'Collection' })
