'use strict'
import { Schema, schemaName, ISchema, bloodyParent } from './schema'
import { ExecutorOrCreator } from '../teambition'

export interface SubtaskData extends ISchema<SubtaskData> {
  _id: string
  _projectId: string
  _creatorId: string
  created: string
  content: string
  isDone: boolean
  _executorId: string
  _taskId: string
  dueDate: string
  order: number
  executor: ExecutorOrCreator
}

@schemaName('Subtask')
export default class Subtask extends Schema implements SubtaskData {
  _id: string = undefined
  _projectId: string = undefined
  _creatorId: string = undefined
  created: string = undefined
  content: string = undefined
  isDone: boolean = undefined
  _executorId: string = undefined
  @bloodyParent('Task') _taskId: string = undefined
  dueDate: string = undefined
  order: number = undefined
  executor: ExecutorOrCreator = undefined
}
