import { SchemaDef, RDBType, Relationship } from '../db'
import { schemaColl } from './schemas'
import {
  ExecutorOrCreator,
  TaskId,
  SubtaskId,
  UserId,
  ProjectId
} from 'teambition-types'

export interface SubtaskSchema {
  _id: SubtaskId
  _projectId: ProjectId
  _creatorId: UserId
  created: string
  content: string
  isDone: boolean
  _executorId: UserId
  _taskId: TaskId
  dueDate: string
  order: number
  executor: ExecutorOrCreator
  updated: string
  type: 'subtask'
  project: {
    _id: ProjectId
    name: string
  }
  task: {
    _id: TaskId
    content: string
  }
}

const schema: SchemaDef<SubtaskSchema> = {
  _creatorId: {
    type: RDBType.STRING
  },
  _executorId: {
    type: RDBType.STRING
  },
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
  content: {
    type: RDBType.STRING
  },
  created: {
    type: RDBType.STRING
  },
  dueDate: {
    type: RDBType.DATE_TIME
  },
  executor: {
    type: Relationship.oneToOne,
    virtual: {
      name: 'User',
      where: (userTable: any) => ({
        _executorId: userTable._id
      })
    }
  },
  isDone: {
    type: RDBType.BOOLEAN
  },
  order: {
    type: RDBType.NUMBER
  },
  updated: {
    type: RDBType.DATE_TIME
  },
  project: {
    type: Relationship.oneToOne,
    virtual: {
      name: 'Project',
      where: (projectTable: any) => ({
        _projectId: projectTable._id
      })
    }
  },
  task: {
    type: Relationship.oneToOne,
    virtual: {
      name: 'Task',
      where: (Tasktable: any) => ({
        _taskId: Tasktable._id
      })
    }
  },
  type: {
    type: RDBType.STRING
  }
}

schemaColl.add({ name: 'Subtask', schema })
