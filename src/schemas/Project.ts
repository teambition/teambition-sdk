'use strict'
import { Schema, schemaName, ISchema, bloodyParent } from './schema'
import {
  ExecutorOrCreator,
  ProjectId,
  UserId,
  OrganizationId,
  RoleId,
  CollectionId,
  ApplicationId,
  CustomFieldValue
} from '../teambition'
import { OrganizationPaymentPlan } from './Organization'
import { UserPaymentPlan } from './UserMe'

interface ProjectApplication {
  _id: ApplicationId
  name: string
  type: number
  order: number
}

interface ProjectOrganization {
  _id: OrganizationId
  description: string
  isExpired: boolean
  isPublic: boolean
  logo: string
  name: string
  plan: OrganizationPaymentPlan
}

export interface ProjectData extends ISchema {
  _creatorId: UserId
  _defaultCollectionId: CollectionId
  _defaultRoleId: RoleId | null
  _id: ProjectId
  _orgRoleId: RoleId | null
  _organizationId: OrganizationId | null
  _roleId: RoleId | null
  _rootCollectionId: CollectionId
  applications: ProjectApplication[]
  category: string
  created: string
  creator: ExecutorOrCreator
  customfields: CustomFieldValue[]
  description: string
  eventsCount: number
  hasOrgRight: number
  hasRight: number
  inviteLink: string | null
  isArchived: boolean
  isDeleted?: boolean
  isPublic: boolean
  isStar: boolean
  isTemplate: boolean
  logo: string
  membersCount: number
  name: string
  organization: ProjectOrganization
  pinyin: string
  plan?: UserPaymentPlan
  postsCount: number
  proTemplateType: 'scrum'
  pushStatus: boolean
  py: string
  shortLink: string
  sortMethod: 'duedate' | 'priority' | 'created_asc' | 'created_desc' | 'startdate' | 'custom'
  starsCount: number
  syncCountsAt?: string //  a Date
  tagsCount: number
  tasksCount: number
  uniqueIdPrefix: string
  unreadCount: number
  updated: string
  visibility: 'project' | 'organization' | 'all' | 'private'
  worksCount: number
}

@schemaName('Project')
export default class ProjectSchema extends Schema<ProjectData> implements ProjectData {
  _creatorId: UserId = undefined
  _defaultCollectionId: CollectionId = undefined
  _defaultRoleId: RoleId | null = undefined
  _id: ProjectId = undefined
  _orgRoleId: RoleId | null = undefined
  @bloodyParent('Organization') _organizationId: OrganizationId | null = undefined
  _roleId: RoleId | null = undefined
  _rootCollectionId: CollectionId = undefined
  applications: ProjectApplication[] = undefined
  category: string = undefined
  created: string = undefined
  creator: ExecutorOrCreator = undefined
  customfields: CustomFieldValue[] = undefined
  description: string = undefined
  eventsCount: number = undefined
  hasOrgRight: number = undefined
  hasRight: number = undefined
  inviteLink: string | null = undefined
  isArchived: boolean = undefined
  isDeleted?: boolean
  isPublic: boolean = undefined
  isStar: boolean = undefined
  isTemplate: boolean = undefined
  logo: string = undefined
  membersCount: number = undefined
  name: string = undefined
  organization: ProjectOrganization = undefined
  pinyin: string = undefined
  plan?: UserPaymentPlan
  postsCount: number = undefined
  proTemplateType: 'scrum' = undefined
  pushStatus: boolean = undefined
  py: string = undefined
  shortLink: string = undefined
  sortMethod: 'duedate' | 'priority' | 'created_asc' | 'created_desc' | 'startdate' | 'custom' = undefined
  starsCount: number = undefined
  syncCountsAt?: string //  a Date
  tagsCount: number = undefined
  tasksCount: number = undefined
  uniqueIdPrefix: string = undefined
  unreadCount: number = undefined
  updated: string = undefined
  visibility: 'project' | 'organization' | 'all' | 'private' = undefined
  worksCount: number = undefined
}
