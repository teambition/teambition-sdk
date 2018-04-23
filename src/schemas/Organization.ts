'use strict'
import { Schema, ISchema, schemaName } from './schema'
import {
  OrganizationId,
  ProjectId,
  RoleId,
  UserId,
  TeamId
} from '../teambition'

export interface OrganizationDivider {
  name: string
  pos: number
}

export interface OrganizationPaymentPlan {
  _objectId: OrganizationId
  days: number
  expired: string
  isExpired: boolean
  isTrialExpired: boolean
  membersCount: number
  objectType: 'organization'
  paidCount: number
  payType: string
  status: string
  trialExpired: string
  trialType: string
}

export interface OrganizationData extends ISchema {
  _creatorId: UserId
  _defaultOrgRoleId: RoleId | null
  _defaultRoleId: RoleId | null
  _defaultTeamId: TeamId | null
  _id: OrganizationId
  _roleId: RoleId
  background: string
  category: string
  created: string
  description: string
  dividers: OrganizationDivider[]
  hasRight: number
  isPublic: boolean
  logo: string
  name: string
  okrProgressMode: string
  pinyin: string
  plan: OrganizationPaymentPlan
  positions: string[]
  projectIds: ProjectId[]
  py: string
  staffTypes: string[]
}

@schemaName('Organization')
export default class Organization extends Schema<OrganizationData> implements OrganizationData {
  _creatorId: UserId = undefined
  _defaultOrgRoleId: RoleId | null = undefined
  _defaultRoleId: RoleId | null = undefined
  _defaultTeamId: TeamId | null = undefined
  _id: OrganizationId = undefined
  _roleId: RoleId = undefined
  background: string = undefined
  category: string = undefined
  created: string = undefined
  description: string = undefined
  dividers: OrganizationDivider[] = undefined
  hasRight: number = undefined
  isPublic: boolean = undefined
  logo: string = undefined
  name: string = undefined
  okrProgressMode: string = undefined
  pinyin: string = undefined
  plan: OrganizationPaymentPlan = undefined
  positions: string[] = undefined
  projectIds: ProjectId[] = undefined
  py: string = undefined
  staffTypes: string[] = undefined
}
