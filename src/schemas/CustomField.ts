'use strict'
import { Schema, schemaName, ISchema } from './schema'
import { ProjectId, CustomFieldId, CustomFieldType, CustomFieldChoice, OrganizationId, UserId, RoleId, CustomFieldBoundType } from '../teambition'

export interface CustomFieldData extends ISchema {
  _creatorId: UserId
  _id: CustomFieldId
  _organizationId: OrganizationId
  _projectId?: ProjectId
  _roleIds: RoleId[]
  boundType: CustomFieldBoundType
  choices: CustomFieldChoice[]
  created: string
  description: string
  displayed: boolean
  name: string
  pos: number
  type: CustomFieldType
  updated: string
}

@schemaName('CustomField')
export default class CustomFieldSchema extends Schema<CustomFieldData> implements CustomFieldData {
  _creatorId: UserId = undefined
  _id: CustomFieldId = undefined
  _organizationId: OrganizationId = undefined
  _projectId?: ProjectId
  _roleIds: RoleId[] = undefined
  boundType: CustomFieldBoundType = undefined
  choices: CustomFieldChoice[] = undefined
  created: string = undefined
  description: string = undefined
  displayed: boolean = undefined
  name: string = undefined
  pos: number = undefined
  type: CustomFieldType = undefined
  updated: string = undefined
}
