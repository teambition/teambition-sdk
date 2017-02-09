'use strict'
import { RDBType, Association, SchemaDef } from 'reactivedb'
import { SubtaskData } from './Subtask'
import { schemas } from '../SDK'
import {
  ExecutorOrCreator,
  visibility,
  TagId,
  TaskId,
  StageId,
  UserId,
  TasklistId,
  ProjectId,
  TaskPriority,
  CustomFields,
  Reminder
} from 'teambition-types'

export interface TaskData {
  _id: TaskId
  content: string
  note: string
  accomplished: string
  startDate?: string
  dueDate: string
  priority: TaskPriority
  isDone: boolean
  isArchived: boolean
  created: string
  updated: string
  visible: visibility
  _stageId: StageId
  _creatorId: UserId
  _tasklistId: TasklistId
  _projectId: ProjectId
  _executorId: UserId
  involveMembers: UserId[]
  tagIds: TagId []
  recurrence?: string
  pos?: number
  _sourceId?: string
  sourceDate?: string
  subtasks?: Partial<SubtaskData>[]
  customfields: CustomFields[]
  involvers: ExecutorOrCreator[]
  commentsCount?: number
  attachmentsCount?: number
  likesCount?: number
  objectlinksCount?: number
  shareStatus: number
  reminder: Reminder
  subtaskCount?: {
    total: number
    done: number
  }
  executor?: ExecutorOrCreator
  stage?: {
    name: string
    _id: StageId
  }
  tasklist?: {
    title: string
    _id: TasklistId
  }
  isFavorite?: boolean,
  project?: {
    _id: ProjectId
    name: string
  },
  uniqueId?: number,
}

const schema: SchemaDef<TaskData> = {
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
  _sourceId: {
    type: RDBType.STRING
  },
  _stageId: {
    type: RDBType.STRING
  },
  _tasklistId: {
    type: RDBType.STRING
  },
  accomplished: {
    type: RDBType.DATE_TIME
  },
  attachmentsCount: {
    type: RDBType.NUMBER
  },
  commentsCount: {
    type: RDBType.NUMBER
  },
  content: {
    type: RDBType.STRING
  },
  created: {
    type: RDBType.DATE_TIME
  },
  customfields: {
    type: RDBType.OBJECT
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
  involvers: {
    type: RDBType.OBJECT
  },
  involveMembers: {
    type: RDBType.LITERAL_ARRAY
  },
  isArchived: {
    type: RDBType.BOOLEAN
  },
  isDone: {
    type: RDBType.BOOLEAN
  },
  isFavorite: {
    type: RDBType.BOOLEAN
  },
  likesCount: {
    type: RDBType.NUMBER
  },
  note: {
    type: RDBType.STRING
  },
  objectlinksCount: {
    type: RDBType.NUMBER
  },
  pos: {
    type: RDBType.NUMBER
  },
  priority: {
    type: RDBType.NUMBER
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
  recurrence: {
    type: RDBType.OBJECT
  },
  reminder: {
    type: RDBType.OBJECT
  },
  shareStatus: {
    type: RDBType.NUMBER
  },
  sourceDate: {
    type: RDBType.DATE_TIME
  },
  stage: {
    type: Association.oneToOne,
    virtual: {
      name: 'Stage',
      where: stageTable => ({
        _stageId: stageTable._id
      })
    }
  },
  startDate: {
    type: RDBType.DATE_TIME
  },
  subtaskCount: {
    type: RDBType.NUMBER
  },
  subtasks: {
    type: Association.oneToMany,
    virtual: {
      name: 'Subtask',
      where: subtaskTable => ({
        _id: (subtaskTable as any)._taskId
      })
    }
  },
  tagIds: {
    type: RDBType.LITERAL_ARRAY
  },
  tasklist: {
    type: Association.oneToOne,
    virtual: {
      name: 'Tasklist',
      where: tasklistTable => ({
        _tasklistId: tasklistTable._id
      })
    }
  },
  uniqueId: {
    type: RDBType.STRING
  },
  updated: {
    type: RDBType.DATE_TIME
  },
  visible: {
    type: RDBType.STRING
  }
}

schemas.push({ name: 'Task', schema })
