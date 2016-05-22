'use strict'
import { Schema, schemaName } from './schema'

@schemaName('Project')
export default class Project extends Schema {
  _id: string = undefined
  name: string = undefined
  _creatorId: string = undefined
  logo: string = undefined
  py: string = undefined
  pinyin: string = undefined
  description: string = undefined
  category: string = undefined
  _organizationId: string = undefined
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
  inviteLink: string = undefined
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
  unreadCount: number = undefined
  unreadMessageCount: number = undefined
  pushStatus: boolean = undefined
  canQuit: boolean = undefined
  canDelete: boolean = undefined
  canArchive: boolean = undefined
  canTransfer: boolean = undefined
  _roleId: number = undefined
  link: {
    inviteLink: string
    mobileInviteLink: string
    signCode: string
    created: string
    expiration: string
  } = undefined
  mobileInviteLink: string = undefined
  signCode: string = undefined
  starsCount: number = undefined
  _rootCollectionId: string = undefined
  _defaultCollectionId: string = undefined
  shortLink: string = undefined
  calLink: string = undefined
  taskCalLink: string = undefined
  _orgRoleId: number = undefined
}
