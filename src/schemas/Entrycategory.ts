'use strict'
import { Schema, schemaName, ISchema } from './schema'
import { IdOfMember, ProjectId, EntryCategoryId } from '../teambition'

export interface EntrycategoryData extends ISchema {
  _id: EntryCategoryId
  _projectId: ProjectId
  _creatorId: IdOfMember
  title: string
  type: number
  icon: string
  isDefault: boolean
  created: string
  updated?: string
  entriesCount?: number
}

@schemaName('Entrycategory')
export default class Entrycategory extends Schema<EntrycategoryData> implements EntrycategoryData {
  _id: EntryCategoryId = undefined
  _projectId: ProjectId = undefined
  _creatorId: IdOfMember = undefined
  title: string = undefined
  type: number = undefined
  isDefault: boolean = undefined
  icon: string = undefined
  created: string = undefined
}
