'use strict'
import { Schema, ISchema, schemaName, child, bloodyParent } from './schema'
import Subtask from './Subtask'
import {
  ExecutorOrCreator,
  visibility,
  TagId,
  TaskId,
  StageId,
  IdOfMember,
  TasklistId,
  ProjectId
} from '../teambition'

export type Priority = 0 | 1 | 2

export interface TaskData extends ISchema {
  _id: TaskId
  content: string
  note: string
  accomplished: string
  startDate?: string
  dueDate: string
  priority: Priority
  isDone: boolean
  isArchived: boolean
  created: string
  updated: string
  visible: visibility
  _stageId: StageId
  _creatorId: IdOfMember
  _tasklistId: TasklistId
  _projectId: ProjectId
  _executorId: IdOfMember
  involveMembers: IdOfMember[]
  tagIds: TagId []
  recurrence?: string
  pos?: number
  _sourceId?: string
  sourceDate?: string
  subtasks?: Subtask[]
  commentsCount?: number
  attachmentsCount?: number
  likesCount?: number
  objectlinksCount?: number
  subtaskCount?: {
    total: number
    done: number
  }
  executor?: ExecutorOrCreator
  stage?: {
    name: string
    _id: StageId
  }
  tasklist?: {
    title: string
    _id: TasklistId
  }
  isFavorite?: boolean
}

@schemaName('Task')
export default class Task extends Schema<TaskData> implements TaskData {
  _id: TaskId = undefined
  content: string = undefined
  note: string = undefined
  accomplished: string = undefined
  dueDate: string = undefined
  priority: Priority = undefined
  isDone: boolean = undefined
  isArchived: boolean = undefined
  created: string = undefined
  updated: string = undefined
  visible: visibility = undefined
  @bloodyParent('Stage') _stageId: StageId = undefined
  _creatorId: IdOfMember = undefined
  _tasklistId: TasklistId = undefined
  _projectId: ProjectId = undefined
  _executorId: IdOfMember = undefined
  involveMembers: IdOfMember[] = undefined
  tagIds: TagId[] = undefined
  @child('Array', 'Subtask') subtasks?: Subtask[]
  @child('Object', 'Project') project?: {
    _id: ProjectId
    name: string
  }
  @child('Object', 'Stage') stage?: {
    name: string
    _id: StageId
  }
  @child('Object', 'Tasklist') tasklist?: {
    title: string
    _id: TasklistId
  }
}
