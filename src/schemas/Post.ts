import {
  ExecutorOrCreator,
  PostId,
  UserId,
  TagId,
  ProjectId,
  VisibleOption
} from 'teambition-types'
import { SchemaDef, RDBType, Relationship } from '../db'
import { schemaColl } from './schemas'
import { FileSchema } from './File'

export type PostModeOptions = 'md' | 'html'

export interface PostSchema {
  _id: PostId
  _projectId: ProjectId
  _creatorId: UserId
  attachments: FileSchema[]
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
  postMode: PostModeOptions
  source: string
  tagIds: TagId[]
  title: string
  updated: string
  visible: VisibleOption
  likesCount: number
  objectlinksCount: number
  objectType: 'post'
  shareStatus: number
}

const Schema: SchemaDef<PostSchema> = {
  _id: {
    type: RDBType.STRING,
    primaryKey: true
  },
  _creatorId: {
    type: RDBType.STRING
  },
  _projectId: {
    type: RDBType.STRING
  },
  attachments: {
    type: RDBType.OBJECT
  },
  attachmentsCount: {
    type: RDBType.NUMBER
  },
  commentsCount: {
    type: RDBType.NUMBER
  },
  content: {
    type: RDBType.STRING
  },
  created: {
    type: RDBType.DATE_TIME
  },
  creator: {
    type: Relationship.oneToOne,
    virtual: {
      name: 'User',
      where: (userTable: any) => ({
        _creatorId: userTable._id
      })
    }
  },
  html: {
    type: RDBType.STRING
  },
  involveMembers: {
    type: RDBType.LITERAL_ARRAY
  },
  isArchived: {
    type: RDBType.BOOLEAN
  },
  isFavorite: {
    type: RDBType.BOOLEAN
  },
  lastCommentedAt: {
    type: RDBType.DATE_TIME
  },
  pin: {
    type: RDBType.BOOLEAN
  },
  postMode: {
    type: RDBType.STRING
  },
  source: {
    type: RDBType.STRING
  },
  tagIds: {
    type: RDBType.LITERAL_ARRAY
  },
  title: {
    type: RDBType.STRING
  },
  updated: {
    type: RDBType.DATE_TIME
  },
  visible: {
    type: RDBType.STRING
  },
  objectlinksCount: {
    type: RDBType.NUMBER
  },
  objectType: {
    type: RDBType.STRING
  },
  likesCount: {
    type: RDBType.NUMBER
  },
  shareStatus: {
    type: RDBType.NUMBER
  }
}

schemaColl.add({ schema: Schema, name: 'Post' })
