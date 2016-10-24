'use strict'
import { Schema, ISchema, schemaName, child, bloodyParent } from './schema'
import Subtask from './Subtask'
import { ExecutorOrCreator, visibility } from '../teambition'

export interface TaskData extends ISchema {
  _id: string
  content: string
  note: string
  accomplished: string
  startDate?: string
  dueDate: string
  priority: number
  isDone: boolean
  isArchived: boolean
  created: string
  updated: string
  visible: visibility
  _stageId: string
  _creatorId: string
  _tasklistId: string
  _projectId: string
  _executorId: string
  involveMembers: string[]
  tagIds?: string []
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
    _id: string
  }
  tasklist?: {
    title: string
    _id: string
  }
  isFavorite?: boolean
}

@schemaName('Task')
export default class Task extends Schema<TaskData> implements TaskData {
  _id: string = undefined
  content: string = undefined
  note: string = undefined
  accomplished: string = undefined
  dueDate: string = undefined
  priority: number = undefined
  isDone: boolean = undefined
  isArchived: boolean = undefined
  created: string = undefined
  updated: string = undefined
  visible: visibility = undefined
  @bloodyParent('Stage') _stageId: string = undefined
  _creatorId: string = undefined
  _tasklistId: string = undefined
  _projectId: string = undefined
  _executorId: string = undefined
  involveMembers: string[] = undefined
  tagIds: string[] = undefined
  @child('Array', 'Subtask') subtasks?: Subtask[]
  @child('Object', 'Project') project?: {
    _id: string
    name: string
  }
  @child('Object', 'Stage') stage?: {
    name: string
    _id: string
  }
  @child('Object', 'Tasklist') tasklist?: {
    title: string
    _id: string
  }
}
