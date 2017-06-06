'use strict'
import { Schema, schemaName, ISchema, bloodyParent } from './schema'
import {
  ExecutorOrCreator,
  TaskId,
  SubtaskId,
  UserId,
  ProjectId
} from '../teambition'

export interface SubtaskData extends ISchema {
  _id: SubtaskId
  _projectId: ProjectId
  _creatorId: UserId
  created: string
  content: string
  isDone: boolean
  _executorId: UserId
  _taskId: TaskId
  dueDate: string
  order: number
  executor: ExecutorOrCreator
  updated?: string
  isInbox?: boolean
}

@schemaName('Subtask')
export default class Subtask extends Schema<SubtaskData> implements SubtaskData {
  _id: SubtaskId = undefined
  _projectId: ProjectId = undefined
  _creatorId: UserId = undefined
  created: string = undefined
  content: string = undefined
  isDone: boolean = undefined
  _executorId: UserId = undefined
  @bloodyParent('Task') _taskId: TaskId = undefined
  dueDate: string = undefined
  order: number = undefined
  executor: ExecutorOrCreator = undefined
}
