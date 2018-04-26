'use strict'
import { Schema, schemaName, ISchema } from './schema'
import { ProjectId, CustomFieldLinkId, RoleId, CustomFieldChoice, CustomFieldType, CustomFieldId, CustomFieldBoundType } from '../teambition'

export interface CustomFieldLinkData extends ISchema {
  _customfieldId: CustomFieldId
  _id: CustomFieldLinkId
  _projectId: ProjectId
  _roleIds: RoleId[]
  boundType?: CustomFieldBoundType
  choices: CustomFieldChoice[]
  description: string
  name: string
  pos: number
  type: CustomFieldType
}

@schemaName('CustomFieldLink')
export default class CustomFieldLinkSchema extends Schema<CustomFieldLinkData> implements CustomFieldLinkData {
  _customfieldId: CustomFieldId = undefined
  _id: CustomFieldLinkId = undefined
  _projectId: ProjectId = undefined
  _roleIds: RoleId[] = undefined
  boundType?: CustomFieldBoundType
  choices: CustomFieldChoice[] = undefined
  description: string = undefined
  name: string = undefined
  pos: number = undefined
  type: CustomFieldType = undefined
}
