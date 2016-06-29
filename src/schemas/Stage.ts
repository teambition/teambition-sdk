'use strict'
import { Schema, schemaName, ISchema } from './schema'

export interface StageData extends ISchema<StageData> {
  _id: string
  _projectId: string
  _tasklistId: string
  name: string
  order: number
  totalCount: number
  isArchived: boolean
}

@schemaName('Stage')
export default class Stage extends Schema implements StageData {
  _id: string = undefined
  _projectId: string = undefined
  _tasklistId: string = undefined
  name: string = undefined
  order: number = undefined
  totalCount: number = undefined
  isArchived: boolean = undefined
}
