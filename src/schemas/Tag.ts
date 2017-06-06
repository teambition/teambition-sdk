'use strict'
import { Schema, ISchema, schemaName } from './schema'
import { TagId, UserId, ProjectId, DefaultColors } from '../teambition'

export interface TagData extends ISchema {
  _creatorId: UserId
  _id: TagId
  _projectId: ProjectId
  color: DefaultColors
  created: string
  isArchived: boolean
  name: string
  updated: string
  postsCount?: number
  tasksCount?: number
  eventsCount?: number
  worksCount?: number
}

@schemaName('Tag')
export default class TagSchema extends Schema<TagData> implements TagData {
  _creatorId: UserId = undefined
  _id: TagId = undefined
  _projectId: ProjectId = undefined
  color: DefaultColors = undefined
  created: string = undefined
  isArchived: boolean = undefined
  name: string = undefined
  updated: string = undefined
}
