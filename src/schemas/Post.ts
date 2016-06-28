'use strict'
import { schemaName, Schema } from './schema'

@schemaName('Post')
export default class Post extends Schema {
  _id: string = undefined
  _projectId: string = undefined
  _creatorId: string = undefined
  title: string = undefined
  content: string = undefined
  attachments: string[] = undefined
  involveMembers: string[] = undefined
  postMode: 'txt' | 'html' = undefined
  isArchived: boolean = undefined
  visiable: string = undefined
  pin: boolean = undefined
  created: string = undefined
  updated: string = undefined
  tagIds: string[] = undefined
  isFavorite: boolean = undefined
  isLike: boolean = undefined
}
