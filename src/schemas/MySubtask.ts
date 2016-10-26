'use strict'
import { schemaName } from './schema'
import { default as Subtask, SubtaskData } from './Subtask'
import { ProjectId, TaskId } from '../teambition'

export interface MySubtaskData extends SubtaskData {
  project: {
    _id: ProjectId
    name: string
  }
  task: {
    _id: TaskId
    content: string
  }
}

@schemaName('MySubtask')
export default class MySubtask extends Subtask implements MySubtaskData {
  project: {
    _id: ProjectId
    name: string
  } = undefined
  task: {
    _id: TaskId
    content: string
  } = undefined
}
