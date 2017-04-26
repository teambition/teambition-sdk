import {
  ExecutorOrCreator,
  PostSource,
  PostId,
  UserId,
  TagId,
  ProjectId,
  FileId
} from 'teambition-types'
import { SchemaDef, RDBType, Relationship } from 'reactivedb'
import { schemas } from '../SDK'

export type PostModeOptions = 'md' | 'html'

export interface PostSchema {
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
  postMode: PostModeOptions
  source: PostSource
  tagIds: TagId[]
  title: string
  updated: string
  visible: string
  likesCount: number
  objectlinksCount: number
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
    type: RDBType.LITERAL_ARRAY
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
      name: 'Member',
      where: (memberTable: any) => ({
        _creatorId: memberTable._id
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
  likesCount: {
    type: RDBType.NUMBER
  },
  shareStatus: {
    type: RDBType.NUMBER
  }
}

schemas.push({ schema: Schema, name: 'Post' })
