'use strict'
import { Schema, schemaName, ISchema, bloodyParent } from './schema'
import { StageId, ProjectId, TasklistId } from '../teambition'

export interface StageData extends ISchema {
  _id: StageId
  _projectId: ProjectId
  _tasklistId: TasklistId
  name: string
  order: number
  totalCount: number
  isArchived: boolean
}

@schemaName('Stage')
export default class Stage extends Schema<StageData> implements StageData {
  _id: StageId = undefined
  _projectId: ProjectId = undefined
  @bloodyParent('Tasklist')_tasklistId: TasklistId = undefined
  name: string = undefined
  order: number = undefined
  totalCount: number = undefined
  isArchived: boolean = undefined
}
