import { SchemaDef, RDBType } from 'reactivedb/interface'
import { schemas } from '../SDK'
import { CollectionId } from 'teambition-types'

export interface CollectionSchema {
  _id: CollectionId
  title: string
  _projectId: string
  _creatorId: string
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

schemas.push({ schema, name: 'Collection' })
