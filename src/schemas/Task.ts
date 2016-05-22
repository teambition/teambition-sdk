'use strict'
import { Schema, schemaName } from './schema'
import Subtask from './Subtask'
import { Executor, visibility } from '../teambition'

@schemaName('Task')
export default class Task extends Schema {
  _id: string = undefined
  _creatorId: string = undefined
  _executorId: string = undefined
  _projectId: string = undefined
  _tasklistId: string = undefined
  tagIds: string [] = undefined
  _stageId: string = undefined
  visiable: visibility = undefined
  visible: visibility = undefined
  involveMembers: string[] = undefined
  updated: string = undefined
  created: string = undefined
  isArchived: boolean = undefined
  isDone: boolean = undefined
  priority: number = undefined
  dueDate: string = undefined
  accomplished: string = undefined
  note: string = undefined
  content: string = undefined
  _sourceId: string = undefined
  sourceDate: string = undefined
  subtasks: Subtask[] = undefined
  commentsCount: number = undefined
  attachmentsCount: number = undefined
  likesCount: number = undefined
  objectlinksCount: number = undefined
  subtaskCount: {
    total: number
    done: number
  } = undefined
  executor: Executor = undefined
  stage: {
    name: string
    _id: string
  } = undefined
  tasklist: {
    title: string
    _id: string
  } = undefined
  isFavorite: boolean = undefined
}
