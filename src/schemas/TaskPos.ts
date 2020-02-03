import { RDBType, SchemaDef } from '../db'
import { schemaColl } from './schemas'
import {
  ProjectId, TaskId, TaskPosId
} from 'teambition-types'

export interface TaskPosSchema {
  _id: TaskPosId
  _projectId: ProjectId,
  view?: string
  _taskId: TaskId,
  pos: number,
  created: string
  updated: string
}

const schema: SchemaDef<TaskPosSchema> = {
  _id: {
    type: RDBType.STRING,
    primaryKey: true
  },
  _projectId: {
    type: RDBType.STRING
  },
  _taskId: {
    type: RDBType.STRING
  },
  view: {
    type: RDBType.STRING
  },
  pos: {
    type: RDBType.NUMBER
  },
  created: {
    type: RDBType.STRING
  },
  updated: {
    type: RDBType.STRING
  }
}

schemaColl.add({ schema, name: 'TaskPos' })
