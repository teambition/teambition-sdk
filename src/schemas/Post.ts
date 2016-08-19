'use strict'
import { schemaName, Schema, ISchema } from './schema'

export interface PostData extends ISchema {
  _id: string
  _projectId: string
  _creatorId: string
  title: string
  content: string
  attachments: string[]
  involveMembers: string[]
  postMode: 'txt' | 'html'
  isArchived: boolean
  visiable: string
  pin: boolean
  created: string
  updated: string
  tagIds: string[]
  isFavorite: boolean
  isLike: boolean
}

@schemaName('Post')
export default class Post extends Schema<PostData> implements PostData {
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
