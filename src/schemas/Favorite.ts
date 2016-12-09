'use strict'
import { Schema, schemaName, ISchema } from './schema'
import {
  FavoriteId,
  UserId,
  ProjectId,
  ExecutorOrCreator,
  DetailObjectType,
  DetailObjectId
} from '../teambition'
import { TaskData } from './Task'
import { PostData } from './Post'
import { FileData } from './File'
import { EventData } from './Event'
import { EntryData } from './Entry'

export interface FavoriteData extends ISchema {
  _id: FavoriteId
  _creatorId: UserId
  _refId: DetailObjectId
  created: string
  updated: string
  refType: DetailObjectType
  isInbox?: boolean
  isVisible: boolean
  isUpdated: boolean
  status: 'deleted' | 'invisible' | 'archived' | 'updated' | ''
  data: (TaskData | PostData | FileData | EventData | EntryData) & {
    project: {
      _id: ProjectId
      name: string
    }
    creator: ExecutorOrCreator
    created: string
    updated: string
  }
}

@schemaName('Favorite')
export default class FavoriteSchema extends Schema<FavoriteData> implements FavoriteData {
  _id: FavoriteId = undefined
  _creatorId: UserId = undefined
  _refId: DetailObjectId = undefined
  created: string = undefined
  updated: string = undefined
  refType: DetailObjectType = undefined
  isVisible: boolean = undefined
  isUpdated: boolean = undefined
  status: 'deleted' | 'invisible' | 'archived' | 'updated' | '' = undefined
  data: (TaskData | PostData | FileData | EventData) & {
    project: {
      _id: ProjectId
      name: string
    }
    creator: ExecutorOrCreator
    created: string
    updated: string
  } = undefined
}
