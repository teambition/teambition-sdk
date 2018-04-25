'use strict'
import { Schema, ISchema, schemaName } from './schema'
import { TaskflowStatusId, UserId, TaskflowId } from '../teambition'

export interface TaskflowStatusData extends ISchema {
  _creatorId: UserId
  _id: TaskflowStatusId
  _taskflowId: TaskflowId
  created: string
  kind: 'start' | 'end' | 'unset'
  name: string
  pos: number
  rejectStatusIds: TaskflowStatusId[]
  taskCount?: number
  updated: string
}

@schemaName('TaskflowStatus')
export default class TaskflowStatusSchema extends Schema<TaskflowStatusData> implements TaskflowStatusData {
  _creatorId: UserId = undefined
  _id: TaskflowStatusId = undefined
  _taskflowId: TaskflowId = undefined
  created: string = undefined
  kind: 'start' | 'end' | 'unset' = undefined
  name: string = undefined
  pos: number = undefined
  rejectStatusIds: TaskflowStatusId[] = undefined
  taskCount?: number = undefined
  updated: string = undefined
}
