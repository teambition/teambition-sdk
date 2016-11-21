'use strict'
import { schemaName, Schema, ISchema } from './schema'
import {
  ExecutorOrCreator,
  PostSource,
  PostId,
  UserId,
  TagId,
  ProjectId,
  FileId
} from '../teambition'

export interface PostData extends ISchema {
  _id: PostId
  _projectId: ProjectId
  _creatorId: UserId
  attachments: FileId[]
  attachmentsCount?: number
  commentsCount?: number
  content: string
  created: string
  creator: ExecutorOrCreator
  html: string
  involveMembers: UserId[]
  isArchived: boolean
  isFavorite: boolean
  lastCommentedAt: string | null
  pin: boolean
  postMode: 'txt' | 'html'
  source: PostSource
  tagIds: TagId[]
  title: string
  updated: string
  visible: string
}

@schemaName('Post')
export default class Post extends Schema<PostData> implements PostData {
  _id: PostId = undefined
  _projectId: ProjectId = undefined
  _creatorId: UserId = undefined
  title: string = undefined
  content: string = undefined
  creator: ExecutorOrCreator = undefined
  attachments: FileId[] = undefined
  involveMembers: UserId[] = undefined
  postMode: 'txt' | 'html' = undefined
  isArchived: boolean = undefined
  visible: string = undefined
  html: string = undefined
  pin: boolean = undefined
  created: string = undefined
  updated: string = undefined
  tagIds: TagId[] = undefined
  isFavorite: boolean = undefined
  source: PostSource = undefined
  lastCommentedAt: string | null = null
}
