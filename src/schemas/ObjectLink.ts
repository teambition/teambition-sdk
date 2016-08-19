'use strict'
import { ISchema, Schema, schemaName, bloodyParentWithProperty } from './schema'
import { ExecutorOrCreator } from '../teambition'

export type parentType = 'task' | 'post' | 'event' | 'work'

export interface ObjectLinkData extends ISchema {
  _id: string
  _creatorId: string
  _parentId: string
  parentType: parentType
  linkedType: string
  _linkedId: string
  created: string
  creator: ExecutorOrCreator
  title: string
  data: any
  project?: {
    _id: string
    name: string
    logo: string
  }
}

@schemaName('ObjectLink')
export default class ObjectLinkSchema extends Schema<ObjectLinkData> implements ObjectLinkData {
  _id: string = undefined
  _creatorId: string = undefined
  @bloodyParentWithProperty('parentType') _parentId: string = undefined
  parentType: parentType = undefined
  linkedType: string = undefined
  _linkedId: string = undefined
  created: string = undefined
  creator: ExecutorOrCreator = undefined
  title: string = undefined
  data: any = undefined
}
