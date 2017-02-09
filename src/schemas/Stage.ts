'use strict'
import { SchemaDef, RDBType } from 'reactivedb'
import { schemas } from '../SDK'
import { StageId, ProjectId, TasklistId } from 'teambition-types'

export interface StageData {
  _id: StageId
  _projectId: ProjectId
  _tasklistId: TasklistId
  name: string
  order: number
  totalCount: number
  isArchived: boolean
}

const schema: SchemaDef<StageData> = {
  _id: {
    type: RDBType.STRING,
    primaryKey: true
  },
  _projectId: {
    type: RDBType.STRING
  },
  _tasklistId: {
    type: RDBType.STRING
  },
  isArchived: {
    type: RDBType.BOOLEAN
  },
  name: {
    type: RDBType.STRING
  },
  order: {
    type: RDBType.NUMBER
  },
  totalCount: {
    type: RDBType.NUMBER
  }
}

schemas.push({ schema, name: 'Stage' })
