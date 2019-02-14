import { RDBType, Relationship, SchemaDef } from '../db'
import {
  TaskDependencyId,
  TaskDependencyKind,
  TaskId,
  UserId,
} from 'teambition-types'
import { schemaColl } from './schemas'
import { TaskSchema } from './Task'

export type TaskDependencySchema<T = ''> = {
  _id: TaskDependencyId
  _fromId: TaskId
  _toId: TaskId
  _creatorId: UserId
  kind: TaskDependencyKind
  created: string
  updated: string
} & (T extends 'with-task' ? {
  from: TaskSchema
  to: TaskSchema
} : {})

const schema: SchemaDef<TaskDependencySchema<'with-task'>> = {
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
  created: {
    type: RDBType.DATE_TIME,
  },
  from: {
    type: Relationship.oneToOne,
    virtual: {
      name: 'Task',
      where: (taskTable: any) => ({
        _fromId: taskTable._id
      })
    }
  },
  kind: {
    type: RDBType.STRING,
  },
  to: {
    type: Relationship.oneToOne,
    virtual: {
      name: 'Task',
      where: (taskTable: any) => ({
        _toId: taskTable._id
      })
    }
  },
  updated: {
    type: RDBType.DATE_TIME,
  }
}

schemaColl.add({ name: 'TaskDependency', schema })
