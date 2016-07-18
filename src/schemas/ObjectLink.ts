'use strict'
import { ISchema, Schema, schemaName } from './schema'

export type parentType = 'task' | 'post' | 'event' | 'work'

export interface ObjectLinkData extends ISchema<ObjectLinkData> {
  _id: string
  _creatorId: string
  _parentId: string
  parentType: parentType
  linkedType: string
  _linkedId: string
  created: string
  creator: {
    _id: string
    name: string
    avatarUrl: string
  }
  title: string
  data: any
  project?: {
    _id: string
    name: string
    logo: string
  }
}

@schemaName('ObjectLink')
export default class ObjectLinkSchema extends Schema implements ObjectLinkData {
  _id: string = undefined
  _creatorId: string = undefined
  _parentId: string = undefined
  parentType: parentType = undefined
  linkedType: string = undefined
  _linkedId: string = undefined
  created: string = undefined
  creator: {
    _id: string
    name: string
    avatarUrl: string
  } = undefined
  title: string = undefined
  data: any = undefined
}
