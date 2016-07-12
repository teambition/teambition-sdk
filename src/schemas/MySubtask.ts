'use strict'
import { schemaName } from './schema'
import { default as Subtask, SubtaskData } from './Subtask'

export interface MySubtaskData extends SubtaskData {
  project: {
    _id: string
    name: string
  }
  task: {
    _id: string
    content: string
  }
}

@schemaName('MySubtask')
export default class MySubtask extends Subtask implements MySubtaskData {
  project: {
    _id: string
    name: string
  } = undefined
  task: {
    _id: string
    content: string
  } = undefined
}
