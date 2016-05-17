'use strict'
import {Schema, schemaName} from './schema'

@schemaName('Stage')
export default class Stage extends Schema {
  _id: string = undefined
  _projectId: string = undefined
  _tasklistId: string = undefined
  name: string = undefined
  order: number = undefined
  totalCount: number = undefined
  isArchived: boolean = undefined
}
