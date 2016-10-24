'use strict'
import { Schema, schemaName, ISchema, child } from './schema'
import { ObjectLinkData } from '../schemas/ObjectLink'
import { visibility, ExecutorOrCreator } from '../teambition'

export interface FileData extends ISchema {
  _id: string
  fileName: string
  fileType: string
  fileSize: number
  fileKey: string
  fileCategory: string
  imageWidth: number
  imageHeight: number
  _parentId: string
  _projectId: string
  _creatorId: string
  creator: ExecutorOrCreator
  tagIds: string[]
  visible: visibility
  downloadUrl: string
  thumbnail: string
  thumbnailUrl: string
  description: string
  source: string
  folder?: string
  involveMembers: string[]
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
  _id: string = undefined
  fileName: string = undefined
  fileType: string = undefined
  fileSize: number = undefined
  fileKey: string = undefined
  fileCategory: string = undefined
  imageWidth: number = undefined
  imageHeight: number = undefined
  _parentId: string = undefined
  _projectId: string = undefined
  _creatorId: string = undefined
  creator: ExecutorOrCreator = undefined
  tagIds: string[] = undefined
  visible: visibility = undefined
  downloadUrl: string = undefined
  thumbnail: string = undefined
  thumbnailUrl: string = undefined
  description: string = undefined
  source: string = undefined
  involveMembers: string[] = undefined
  created: string = undefined
  updated: string = undefined
  lastVersionTime: string = undefined
  isArchived: boolean = undefined
  previewUrl: string = undefined
  @child('Array', 'ObjectLink') linked?: ObjectLinkData[]
}
