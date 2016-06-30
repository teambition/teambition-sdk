'use strict'
import { Schema, schemaName, ISchema } from './schema'
import { StageData } from '../schemas/Stage'

export interface TasklistData extends ISchema<TasklistData> {
  _id: string
  title: string
  _projectId: string
  _creatorId: string
  description: string
  isArchived: boolean
  created: string
  updated: string
  stageIds: string[]
  doneCount: number
  undoneCount: number
  expiredCount: number
  recentCount: number
  totalCount: number
  hasStages: StageData[]
}

@schemaName('Tasklist')
export default class Tasklist extends Schema implements TasklistData {
  _id: string = undefined
  title: string = undefined
  _projectId: string = undefined
  _creatorId: string = undefined
  description: string = undefined
  isArchived: boolean = undefined
  created: string = undefined
  updated: string = undefined
  stageIds: string[] = undefined
  doneCount: number = undefined
  undoneCount: number = undefined
  expiredCount: number = undefined
  recentCount: number = undefined
  totalCount: number = undefined
  hasStages: StageData[] = undefined
}
