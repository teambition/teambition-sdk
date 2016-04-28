'use strict'
import {Schema} from './schema'
import {Executor} from '../teambition'

export default class Subtask extends Schema {
  _id: string = undefined
  _projectId: string = undefined
  _creatorId: string = undefined
  content: string = undefined
  isDone: boolean = undefined
  _executorId: string = undefined
  _taskId: string = undefined
  dueDate: string = undefined
  order: number = undefined
  executor: Executor = undefined
}
