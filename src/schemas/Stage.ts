'use strict'
import {Schema} from './schema'

export default class Stage extends Schema {
  _id: string = undefined
  _projectId: string = undefined
  _tasklistId: string = undefined
  name: string = undefined
  order: number = undefined
}
