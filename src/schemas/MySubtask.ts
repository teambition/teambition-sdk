'use strict'
import {schemaName} from './schema'
import Subtask from './Subtask'

@schemaName('MySubtask')
export default class MySubtask extends Subtask {
  project: {
    _id: string
    name: string
  } = undefined
  task: {
    _id: string
    content: string
  } = undefined
}
