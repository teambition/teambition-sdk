'use strict'
import Subtask from './Subtask'

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
