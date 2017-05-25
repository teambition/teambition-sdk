'use strict'
import { Schema, schemaName, ISchema } from './schema'
import { ProjectId, CustomFieldId, CustomFieldType, CustomFieldChoice } from '../teambition'

export interface CustomFieldData extends ISchema {
  _id: CustomFieldId
  name: string
  type: CustomFieldType
  choices?: CustomFieldChoice[]
  _creatorId: string
  _projectId: ProjectId
  created?: string
  updated?: string
  displayed?: boolean
  pos?: number
  _roleIds?: string[]
}

@schemaName('CustomFieldSchema')
export default class CustomFieldSchema extends Schema<CustomFieldData> implements CustomFieldData {
  _id: CustomFieldId = undefined
  name: string = undefined
  type: CustomFieldType = undefined
  choices?: CustomFieldChoice[] = undefined
  _creatorId: string = undefined
  _projectId: string = undefined
  created?: string = undefined
  updated?: string = undefined
  displayed?: boolean = undefined
  pos?: number = undefined
  _roleIds?: string[] = undefined
}
