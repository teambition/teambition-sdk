'use strict'
import { schemaName, ISchema } from './schema'
import DefaultRoleSchema from './DefaultRole'

export interface CustomRoleData extends ISchema {
  _id: string
  name: string
  _creatorId: string
  _organizationId: string
  // ISO Date String
  updated: string
  // ISO Date String
  created: string
  permissions: string[]
}

@schemaName('Role')
export default class CustomRoleSchema extends DefaultRoleSchema implements CustomRoleData {
  _id: string = undefined
  _creatorId: string = undefined
  _organizationId: string = undefined
  updated: string = undefined
  created: string = undefined
}
