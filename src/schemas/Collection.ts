'use strict'
import { ISchema, Schema, schemaName } from './schema'

export interface TBCollectionData extends ISchema<TBCollectionData> {
  _id: string
  title: string
  _projectId: string
  _creatorId: string
  _parentId: string
  collectionType: string
  description: string
  isArchived: boolean
  created: string
  updated: string
}

@schemaName('TBCollection')
export default class TBCollection extends Schema implements TBCollectionData {
  _id: string = undefined
  title: string = undefined
  _projectId: string = undefined
  _creatorId: string = undefined
  _parentId: string = undefined
  collectionType: string = undefined
  description: string = undefined
  isArchived: boolean = undefined
  created: string = undefined
  updated: string = undefined
}
