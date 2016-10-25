'use strict'
import { ISchema, Schema, schemaName } from './schema'
import { CollectionId } from '../teambition'

export interface TBCollectionData extends ISchema {
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

@schemaName('TBCollection')
export default class TBCollection extends Schema<TBCollectionData> implements TBCollectionData {
  _id: CollectionId = undefined
  title: string = undefined
  _projectId: string = undefined
  _creatorId: string = undefined
  _parentId: CollectionId = undefined
  collectionType: string = undefined
  description: string = undefined
  isArchived: boolean = undefined
  created: string = undefined
  updated: string = undefined
}
