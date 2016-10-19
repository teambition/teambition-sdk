'use strict'
import { schemaName, Schema, ISchema } from './schema'
import { ExecutorOrCreator, PostSource } from '../teambition'

export interface PostData extends ISchema {
  _id: string
  _projectId: string
  _creatorId: string
  attachments: string[]
  attachmentsCount?: number
  commentsCount?: number
  content: string
  created: string
  creator: ExecutorOrCreator
  html: string
  involveMembers: string[]
  isArchived: boolean
  isFavorite: boolean
  lastCommentedAt: string | null
  pin: boolean
  postMode: 'txt' | 'html'
  source: PostSource
  tagIds: string[]
  title: string
  updated: string
  visible: string
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
  visible: string = undefined
  html: string = undefined
  pin: boolean = undefined
  created: string = undefined
  updated: string = undefined
  tagIds: string[] = undefined
  isFavorite: boolean = undefined
  source: PostSource = undefined
  lastCommentedAt: string | null = null
}
