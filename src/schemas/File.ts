'use strict'
import { Schema, schemaName, ISchema, child } from './schema'
import { ObjectLinkData } from '../schemas/ObjectLink'
import {
  FileId,
  CollectionId,
  TagId,
  ProjectId,
  UserId,
  visibility,
  ExecutorOrCreator
} from '../teambition'

export interface FileData extends ISchema {
  _id: FileId
  fileName: string
  fileType: string
  fileSize: number
  fileKey: string
  fileCategory: string
  imageWidth: number
  imageHeight: number
  _parentId: CollectionId
  _projectId: ProjectId
  _creatorId: UserId
  creator: ExecutorOrCreator
  tagIds: TagId[]
  visible: visibility
  downloadUrl: string
  thumbnail: string
  thumbnailUrl: string
  description: string
  source: string
  involveMembers: UserId[]
  created: string
  updated: string
  lastVersionTime: string
  isArchived: boolean
  previewUrl: string
  attachmentsCount?: number
  commentsCount?: number
  objectlinksCount?: number
  pinyin?: string
  py?: string
  class?: string
  creatorName?: string
  creatorAvatar?: string
  isFavorite?: boolean
  likesCount?: number
  linked?: ObjectLinkData[]
}

@schemaName('File')
export default class File extends Schema<FileData> implements FileData {
  _id: FileId = undefined
  fileName: string = undefined
  fileType: string = undefined
  fileSize: number = undefined
  fileKey: string = undefined
  fileCategory: string = undefined
  imageWidth: number = undefined
  imageHeight: number = undefined
  _parentId: CollectionId = undefined
  _projectId: ProjectId = undefined
  _creatorId: UserId = undefined
  creator: ExecutorOrCreator = undefined
  tagIds: TagId[] = undefined
  visible: visibility = undefined
  downloadUrl: string = undefined
  thumbnail: string = undefined
  thumbnailUrl: string = undefined
  description: string = undefined
  source: string = undefined
  involveMembers: UserId[] = undefined
  created: string = undefined
  updated: string = undefined
  lastVersionTime: string = undefined
  isArchived: boolean = undefined
  previewUrl: string = undefined
  @child('Array', 'ObjectLink') linked?: ObjectLinkData[]
}
