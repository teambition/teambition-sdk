'use strict'
import { Schema, schemaName, ISchema, bloodyParent } from './schema'
import {
  ExecutorOrCreator,
  ProjectId,
  UserId,
  OrganizationId,
  RoleId,
  CollectionId,
  ApplicationId
} from '../teambition'

export interface ProjectData extends ISchema {
  _id: ProjectId
  name: string
  _creatorId: UserId
  logo: string
  py: string
  pinyin: string
  description: string
  category: string
  _organizationId: OrganizationId
  navigation?: {
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
    _id: OrganizationId
    isExpired: boolean
  }
  unreadCount?: number
  unreadMessageCount?: number
  uniqueIdPrefix?: string
  _defaultRoleId: RoleId | null
  creator: ExecutorOrCreator
  pushStatus: boolean
  canQuit: boolean
  canDelete: boolean
  canArchive: boolean
  canTransfer: boolean
  _roleId: RoleId | null
  _rootCollectionId: CollectionId
  _defaultCollectionId: CollectionId
  _orgRoleId: RoleId | null
  applications?: {
    _id: ApplicationId
    name: string
    type?: number
    order?: number
  }[]
}

@schemaName('Project')
export default class ProjectSchema extends Schema<ProjectData> implements ProjectData {
  _id: ProjectId = undefined
  name: string = undefined
  _creatorId: UserId = undefined
  logo: string = undefined
  py: string = undefined
  pinyin: string = undefined
  description: string = undefined
  category: string = undefined
  @bloodyParent('Organization') _organizationId: OrganizationId = undefined
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
  isPublic: boolean = undefined
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
    _id: OrganizationId
    isExpired: boolean
  } = undefined
  _defaultRoleId: RoleId | null = undefined
  creator: ExecutorOrCreator = undefined
  pushStatus: boolean = undefined
  canQuit: boolean = undefined
  canDelete: boolean = undefined
  canArchive: boolean = undefined
  canTransfer: boolean = undefined
  _roleId: RoleId | null = undefined
  link: {
    created: string
    expiration: string
  } = undefined
  _rootCollectionId: CollectionId = undefined
  _defaultCollectionId: CollectionId = undefined
  shortLink: string = undefined
  _orgRoleId: RoleId | null = undefined
}
