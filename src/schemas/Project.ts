'use strict'
import { Schema, schemaName, ISchema, bloodyParent } from './schema'

export interface ProjectData extends ISchema<ProjectData> {
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
  forksCount: number
  tasksCount: number
  postsCount: number
  eventsCount: number
  worksCount: number
  tagsCount: number
  _defaultRoleId: string
  creator: {
    name: string
    avatarUrl: string
    _id: string
  }
  unreadCount?: number
  unreadMessageCount?: number
  pushStatus: boolean
  canQuit: boolean
  canDelete: boolean
  canArchive: boolean
  canTransfer: boolean
  _roleId: number
  link: {
    created: string
    expiration: string
  }
  signCode: string
  starsCount: number
  _rootCollectionId: string
  _defaultCollectionId: string
  shortLink: string
  _orgRoleId: number
  applications?: {
    _id: string
    name: string
    type?: number
    order?: number
  }[]
}

@schemaName('Project')
export default class Project extends Schema implements ProjectData {
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
  forksCount: number = undefined
  tasksCount: number = undefined
  postsCount: number = undefined
  eventsCount: number = undefined
  worksCount: number = undefined
  tagsCount: number = undefined
  _defaultRoleId: string = undefined
  creator: {
    name: string
    avatarUrl: string
    _id: string
  } = undefined
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
  signCode: string = undefined
  starsCount: number = undefined
  _rootCollectionId: string = undefined
  _defaultCollectionId: string = undefined
  shortLink: string = undefined
  _orgRoleId: number = undefined
}
