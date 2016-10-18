'use strict'
import { schemaName, Schema, ISchema } from './schema'
import { ExecutorOrCreator, PostSource } from '../teambition'

export interface PostData extends ISchema {
  _id: string
  _projectId: string
  _creatorId: string
  title: string
  content: string
  creator: ExecutorOrCreator
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
  source: PostSource
  lastCommentedAt: string | null
}

@schemaName('Post')
export default class Post extends Schema<PostData> implements PostData {
  _id: string = undefined
  _projectId: string = undefined
  _creatorId: string = undefined
  title: string = undefined
  content: string = undefined
  creator: ExecutorOrCreator = undefined
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
  source: PostSource = undefined
  lastCommentedAt: string | null = null
}
