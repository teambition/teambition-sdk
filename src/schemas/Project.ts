'use strict'
import { Schema, schemaName, ISchema, bloodyParent } from './schema'
import { ExecutorOrCreator } from '../teambition'

export interface ProjectData extends ISchema {
  _id: string
  name: string
  _creatorId: string
  logo: string
  py: string
  pinyin: string
  description: string
  category: string
  _organizationId: string
  navigation: {
    tasks: number
    posts: number
    events: number
    files: number
    tags: number
    bookkeeping: number
    home: number
    review: number
  }
  visibility: string
  isPublic: boolean
  created: string
  updated: string
  isArchived: boolean
  isStar: boolean
  hasRight: number
  hasOrgRight: number
  organization: {
    name: string
    description: string
    logo: string
    isPublic: boolean
    _id: string
    isExpired: boolean
  }
  unreadCount?: number
  unreadMessageCount?: number
  _defaultRoleId: string
  creator: ExecutorOrCreator
  pushStatus: boolean
  canQuit: boolean
  canDelete: boolean
  canArchive: boolean
  canTransfer: boolean
  _roleId: number
  _rootCollectionId: string
  _defaultCollectionId: string
  _orgRoleId: number
  applications?: {
    _id: string
    name: string
    type?: number
    order?: number
  }[]
}

@schemaName('Project')
export default class ProjectSchema extends Schema<ProjectData> implements ProjectData {
  _id: string = undefined
  name: string = undefined
  _creatorId: string = undefined
  logo: string = undefined
  py: string = undefined
  pinyin: string = undefined
  description: string = undefined
  category: string = undefined
  @bloodyParent('Organization') _organizationId: string = undefined
  navigation: {
    tasks: number
    posts: number
    events: number
    files: number
    tags: number
    bookkeeping: number
    home: number
    review: number
  } = undefined
  visibility: string = undefined
  isPublic: boolean
  created: string = undefined
  updated: string = undefined
  isArchived: boolean = undefined
  isStar: boolean = undefined
  hasRight: number = undefined
  hasOrgRight: number = undefined
  organization: {
    name: string
    description: string
    logo: string
    isPublic: boolean
    _id: string
    isExpired: boolean
  } = undefined
  _defaultRoleId: string = undefined
  creator: ExecutorOrCreator = undefined
  pushStatus: boolean = undefined
  canQuit: boolean = undefined
  canDelete: boolean = undefined
  canArchive: boolean = undefined
  canTransfer: boolean = undefined
  _roleId: number = undefined
  link: {
    created: string
    expiration: string
  } = undefined
  _rootCollectionId: string = undefined
  _defaultCollectionId: string = undefined
  shortLink: string = undefined
  _orgRoleId: number = undefined
}
