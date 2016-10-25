'use strict'
import { schemaName, ISchema, Schema } from './schema'
import { CustomRoleId, OrganizationId } from '../teambition'

export interface CustomRoleData extends ISchema {
  _id: CustomRoleId
  name: string
  _creatorId: string
  _organizationId: OrganizationId
  // ISO Date String
  updated: string
  // ISO Date String
  created: string
  permissions: string[]
}

@schemaName('Role')
export default class CustomRoleSchema extends Schema<CustomRoleData> implements CustomRoleData {
  _id: CustomRoleId = undefined
  _creatorId: string = undefined
  _organizationId: OrganizationId = undefined
  name: string = undefined
  permissions: string[]
  updated: string = undefined
  created: string = undefined
}
