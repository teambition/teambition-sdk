'use strict'
import { Schema, schemaName } from './schema'
import { StageData } from '../teambition'

@schemaName('Tasklist')
export default class Tasklist extends Schema {
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
