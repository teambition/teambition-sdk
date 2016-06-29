'use strict'
import { Schema, schemaName, ISchema } from './schema'
import { MemberData, visibility, LinkedData } from '../teambition'

export interface FileData extends ISchema<FileData> {
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
  creator: MemberData
  tagIds: string[]
  visiable: visibility
  downloadUrl: string
  thumbnail: string
  thumbnailUrl: string
  description: string
  source: string
  folder: string
  involveMembers: string[]
  created: string
  updated: string
  lastVersionTime: string
  isArchived: boolean
  previewUrl: string
  class: string
  creatorName: string
  creatorAvatar: string
  linked: LinkedData[]
  isLike: boolean
  likedPeople: string
  likesCount: number
}

@schemaName('File')
export default class File extends Schema implements FileData {
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
  creator: MemberData = undefined
  tagIds: string[] = undefined
  visiable: visibility = undefined
  downloadUrl: string = undefined
  thumbnail: string = undefined
  thumbnailUrl: string = undefined
  description: string = undefined
  source: string = undefined
  folder: string = undefined
  involveMembers: string[] = undefined
  created: string = undefined
  updated: string = undefined
  lastVersionTime: string = undefined
  isArchived: boolean = undefined
  previewUrl: string = undefined
  class: string = undefined
  creatorName: string = undefined
  creatorAvatar: string = undefined
  linked: LinkedData[] = undefined
  isLike: boolean = undefined
  likedPeople: string = undefined
  likesCount: number = undefined
}
