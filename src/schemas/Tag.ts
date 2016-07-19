import { Schema, ISchema, schemaName } from './schema'

export interface TagData extends ISchema<TagData> {
  _creatorId: string
  _id: string
  _projectId: string
  color: string
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
export default class TagSchema extends Schema implements TagData {
  _creatorId: string = undefined
  _id: string = undefined
  _projectId: string = undefined
  color: string = undefined
  created: string = undefined
  isArchived: boolean = undefined
  name: string = undefined
  updated: string = undefined
}
