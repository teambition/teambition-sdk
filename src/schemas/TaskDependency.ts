import { RDBType, SchemaDef } from 'reactivedb/interface'
import {
  TaskDependencyId,
  TaskDependencyKind,
  TaskId,
  UserId,
} from 'teambition-types'
import { schemaColl } from './schemas'

export interface TaskDependencySchema {
  _id: TaskDependencyId
  _fromId: TaskId
  _toId: TaskId
  _creatorId: UserId
  kind: TaskDependencyKind
  created: string
  updated: string
}

const schema: SchemaDef<TaskDependencySchema> = {
  _id: {
    type: RDBType.STRING,
    primaryKey: true
  },
  _fromId: {
    type: RDBType.STRING,
  },
  _toId: {
    type: RDBType.STRING,
  },
  _creatorId: {
    type: RDBType.STRING,
  },
  kind: {
    type: RDBType.STRING,
  },
  created: {
    type: RDBType.DATE_TIME,
  },
  updated: {
    type: RDBType.DATE_TIME,
  }
}

schemaColl.add({ name: 'TaskDependency', schema })
