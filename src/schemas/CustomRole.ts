'use strict'
import { schemaName, ISchema } from './schema'
import DefaultRoleScheam from './DefaultRole'

export interface CustomRoleData extends ISchema<CustomRoleData> {
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
export default class CustomRoleSchema extends DefaultRoleScheam implements CustomRoleData {
  _id: string = undefined
  _creatorId: string = undefined
  _organizationId: string = undefined
  updated: string = undefined
  created: string = undefined
}
