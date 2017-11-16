import { RDBType, SchemaDef } from 'reactivedb/interface'
import { SprintId, ProjectId, UserId } from 'teambition-types'
import { schemas } from '../SDK'

export interface SprintSchema {
  _id: SprintId
  _creatorId: UserId
  _projectId: ProjectId
  name: string
  startDate: string | null
  dueDate: string | null
  isDeleted: boolean
  status: 'future' | 'active' | 'complete'
  created: string
  updated: string
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
  created: {
    type: RDBType.DATE_TIME
  },
  dueDate: {
    type: RDBType.DATE_TIME
  },
  isDeleted: {
    type: RDBType.BOOLEAN
  },
  name: {
    type: RDBType.STRING
  },
  startDate: {
    type: RDBType.DATE_TIME
  },
  status: {
    type: RDBType.STRING
  },
  updated: {
    type: RDBType.DATE_TIME
  }
}

schemas.push({ name: 'Sprint', schema })
