'use strict'
import { ISchema, Schema, schemaName, bloodyParentWithProperty } from './schema'
import {
  ExecutorOrCreator,
  ObjectLinkId,
  ProjectId,
  UserId,
  DetailObjectId
} from '../teambition'

export type parentType = 'task' | 'post' | 'event' | 'work'

export interface ObjectLinkData extends ISchema {
  _id: ObjectLinkId
  _creatorId: UserId
  _parentId: DetailObjectId
  parentType: parentType
  linkedType: parentType
  _linkedId: DetailObjectId
  created: string
  creator: ExecutorOrCreator
  title: string
  data: any
  project?: {
    _id: ProjectId
    name: string
    logo: string
  }
}

@schemaName('ObjectLink')
export default class ObjectLinkSchema extends Schema<ObjectLinkData> implements ObjectLinkData {
  _id: ObjectLinkId = undefined
  _creatorId: UserId = undefined
  @bloodyParentWithProperty('parentType') _parentId: DetailObjectId = undefined
  parentType: parentType = undefined
  linkedType: parentType = undefined
  _linkedId: DetailObjectId = undefined
  created: string = undefined
  creator: ExecutorOrCreator = undefined
  title: string = undefined
  data: any = undefined
}
