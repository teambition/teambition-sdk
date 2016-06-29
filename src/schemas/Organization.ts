'use strict'
import { Schema, ISchema, schemaName } from './schema'

export interface OrganizationData extends ISchema<OrganizationData> {
  _id: string
  name: string
  _creatorId: string
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
  projectIds: string[]
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
  _defaultRoleId: string
  _roleId: number
}

@schemaName('Organization')
export default class Organization extends Schema implements OrganizationData {
  _id: string = undefined
  name: string = undefined
  _creatorId: string = undefined
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
  projectIds: string[] = undefined
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
  _defaultRoleId: string = undefined
  _roleId: number = undefined
}
