import { RDBType, SchemaDef } from 'reactivedb/interface'
import {
  SprintId,
  ProjectId,
  UserId,
} from 'teambition-types'
import { schemas } from '../SDK'

export interface SprintSchema {
  _id: SprintId
  name: string
  created: string
  updated: string
  dueDate: string | null
  startDate: string | null
  isDeleted: boolean
  status: 'future' | 'active' | 'complete'
  _creatorId: UserId
  _projectId: ProjectId
}

const schema: SchemaDef<SprintSchema> = {
  _id: {
    type: RDBType.STRING,
    primaryKey: true,
  },
  _creatorId: {
    type: RDBType.STRING
  },
  _projectId: {
    type: RDBType.STRING
  },
  name: {
    type: RDBType.STRING
  },
  created: {
    type: RDBType.DATE_TIME
  },
  updated: {
    type: RDBType.DATE_TIME
  },
  dueDate: {
    type: RDBType.DATE_TIME
  },
  startDate: {
    type: RDBType.DATE_TIME
  },
  isDeleted: {
    type: RDBType.BOOLEAN
  },
  status: {
    type: RDBType.STRING
  },
}

schemas.push({ name: 'Sprint', schema })
