'use strict'
import { Schema, schemaName, ISchema } from './schema'

export interface EntrycategoryData extends ISchema {
  _id: string
  _projectId: string
  _creatorId: string
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
  _id: string = undefined
  _projectId: string = undefined
  _creatorId: string = undefined
  title: string = undefined
  type: number = undefined
  isDefault: boolean = undefined
  icon: string = undefined
  created: string = undefined
  entriesCount: number = undefined
}
