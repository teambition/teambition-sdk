'use strict'
import { Schema, schemaName, ISchema, bloodyParent } from './schema'
import { StageData } from '../schemas/Stage'
import { TasklistId, StageId, ProjectId, UserId } from '../teambition'

export interface TasklistData extends ISchema {
  _id: TasklistId
  title: string
  _projectId: ProjectId
  _creatorId: UserId
  description: string
  isArchived: boolean
  created: string
  updated: string
  stageIds: StageId[]
  doneCount: number
  undoneCount: number
  expiredCount: number
  recentCount: number
  totalCount: number
  hasStages: StageData[]
}

@schemaName('Tasklist')
export default class Tasklist extends Schema<TasklistData> implements TasklistData {
  _id: TasklistId = undefined
  title: string = undefined
  @bloodyParent('Project')_projectId: ProjectId = undefined
  _creatorId: UserId = undefined
  description: string = undefined
  isArchived: boolean = undefined
  created: string = undefined
  updated: string = undefined
  stageIds: StageId[] = undefined
  doneCount: number = undefined
  undoneCount: number = undefined
  expiredCount: number = undefined
  recentCount: number = undefined
  totalCount: number = undefined
  hasStages: StageData[] = undefined
}
