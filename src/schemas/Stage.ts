'use strict'
import { Schema, schemaName, ISchema, bloodyParent } from './schema'

export interface StageData extends ISchema {
  _id: string
  _projectId: string
  _tasklistId: string
  name: string
  order: number
  totalCount: number
  isArchived: boolean
}

@schemaName('Stage')
export default class Stage extends Schema<StageData> implements StageData {
  _id: string = undefined
  _projectId: string = undefined
  @bloodyParent('Tasklist')_tasklistId: string = undefined
  name: string = undefined
  order: number = undefined
  totalCount: number = undefined
  isArchived: boolean = undefined
}
