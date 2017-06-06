'use strict'
import { Schema, ISchema, schemaName } from './schema'
import {
  OrganizationId,
  ProjectId,
  RoleId,
  UserId
} from '../teambition'

export interface OrganizationData extends ISchema {
  _id: OrganizationId
  name: string
  _creatorId: UserId
  logo: string
  description: string
  category: string
  pinyin: string
  py: string
  isPublic: boolean
  dividers: {
    name: string
    pos: number
  }[]
  projectIds: ProjectId[]
  created: string
  background: string
  plan: {
    lastPaidTime?: string
    firstPaidTime?: string
    updated?: string
    created?: string
    expired: string
    free?: boolean
    membersCount: number
    days: number
  }
  _defaultRoleId: RoleId | null
  _roleId: RoleId
}

@schemaName('Organization')
export default class Organization extends Schema<OrganizationData> implements OrganizationData {
  _id: OrganizationId = undefined
  name: string = undefined
  _creatorId: UserId = undefined
  logo: string = undefined
  description: string = undefined
  category: string = undefined
  pinyin: string = undefined
  py: string = undefined
  isPublic: boolean = undefined
  dividers: {
    name: string
    pos: number
  }[] = undefined
  projectIds: ProjectId[] = undefined
  created: string = undefined
  background: string = undefined
  plan: {
    lastPaidTime?: string
    firstPaidTime?: string
    updated?: string
    created?: string
    expired: string
    free?: boolean
    membersCount: number
    days: number
  } = undefined
  _defaultRoleId: RoleId | null = undefined
  _roleId: RoleId = undefined
}
