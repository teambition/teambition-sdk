import { SchemaDef, RDBType, Association } from 'reactivedb'
import { schemas } from '../SDK'
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
    type: Association.oneToOne,
    virtual: {
      name: 'Member',
      where: memberTable => ({
        _executorId: memberTable._id
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
    type: Association.oneToOne,
    virtual: {
      name: 'Project',
      where: projectTable => ({
        _projectId: projectTable._id
      })
    }
  },
  task: {
    type: Association.oneToOne,
    virtual: {
      name: 'Task',
      where: Tasktable => ({
        _taskId: Tasktable._id
      })
    }
  },
  type: {
    type: RDBType.STRING
  }
}

schemas.push({ name: 'Subtask', schema })
