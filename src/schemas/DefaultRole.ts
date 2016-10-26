'use strict'
import { Schema, ISchema, schemaName } from './schema'
import { DefaultRoleId } from '../teambition'

export type DefaultRoleName = 'guest' | 'member' | 'admin' | 'owner'

export interface DefaultRoleData extends ISchema {
  _id: DefaultRoleId
  name: DefaultRoleName
  permissions: string []
}

@schemaName('Role')
export default class DefaultRoleSchema extends Schema<DefaultRoleData> implements DefaultRoleData {
  _id: DefaultRoleId = undefined
  name: DefaultRoleName = undefined
  permissions: string [] = undefined
}
