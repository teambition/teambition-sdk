import { SchemaDef, RDBType } from 'reactivedb/interface'
import { schemaColl } from './schemas'
import { StageId, ProjectId, TasklistId, UserId } from 'teambition-types'

export interface StageSchema {
  _id: StageId
  _creatorId: UserId
  _projectId: ProjectId
  _tasklistId: TasklistId
  name: string
  order: number
  totalCount: number
  isArchived: boolean
  isLocked?: boolean
}

const schema: SchemaDef<StageSchema> = {
  _id: {
    type: RDBType.STRING,
    primaryKey: true
  },
  _creatorId: {
    type: RDBType.STRING
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
  isLocked: {
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

schemaColl.add({ schema, name: 'Stage' })
