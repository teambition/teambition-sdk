import { RDBType, Relationship, SchemaDef } from 'reactivedb/interface'
import { CustomFieldValue, ExecutorOrCreator, Reminder, Visibility } from 'teambition-types'
import { ProjectId, StageId, SubtaskId, TagId, TaskId, TasklistId, TaskPriority, UserId } from 'teambition-types'
import { SubtaskSchema } from './Subtask'
import { schemas } from '../SDK'

export interface TaskSchema {
  _id: TaskId
  content: string
  note: string
  accomplished: string
  startDate: string
  dueDate: string
  priority: TaskPriority
  isDone: boolean
  isArchived: boolean
  isDeleted: boolean
  created: string
  updated: string
  visible: Visibility
  _stageId: StageId
  _creatorId: UserId
  _tasklistId: TasklistId
  _projectId: ProjectId
  _executorId: UserId
  involveMembers: UserId[]
  tagIds: TagId[]
  recurrence: string[]
  pos: number
  _sourceId: string
  sourceDate: string
  subtasks: Partial<SubtaskSchema>[]
  subtaskIds: SubtaskId[]
  source: string
  customfields: CustomFieldValue[]
  involvers: ExecutorOrCreator[]
  commentsCount: number
  attachmentsCount: number
  likesCount: number
  objectlinksCount: number
  shareStatus: number
  reminder: Reminder
  subtaskCount: {
    total: number
    done: number
  }
  executor: ExecutorOrCreator
  stage: {
    name: string
    _id: StageId
  }
  tasklist: {
    title: string
    _id: TasklistId
  }
  type: 'task'
  isFavorite: boolean,
  project: {
    _id: ProjectId
    name: string
  },
  uniqueId: number
  url: string
}

const schema: SchemaDef<TaskSchema> = {
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
    type: Relationship.oneToOne,
    virtual: {
      name: 'Member',
      where: (memberTable: any) => ({
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
  isDeleted: {
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
    type: Relationship.oneToOne,
    virtual: {
      name: 'Project',
      where: (projectTable: any) => ({
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
  source: {
    type: RDBType.STRING
  },
  sourceDate: {
    type: RDBType.DATE_TIME
  },
  stage: {
    type: Relationship.oneToOne,
    virtual: {
      name: 'Stage',
      where: (stageTable: any) => ({
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
  subtaskIds: {
    type: RDBType.LITERAL_ARRAY
  },
  subtasks: {
    type: Relationship.oneToMany,
    virtual: {
      name: 'Subtask',
      where: (subtaskTable: any) => ({
        _id: subtaskTable._taskId
      })
    }
  },
  tagIds: {
    type: RDBType.LITERAL_ARRAY
  },
  tasklist: {
    type: Relationship.oneToOne,
    virtual: {
      name: 'Tasklist',
      where: (tasklistTable: any) => ({
        _tasklistId: tasklistTable._id
      })
    }
  },
  type: {
    type: RDBType.STRING
  },
  uniqueId: {
    type: RDBType.STRING
  },
  updated: {
    type: RDBType.DATE_TIME
  },
  url: {
    type: RDBType.STRING
  },
  visible: {
    type: RDBType.STRING
  }
}

schemas.push({ name: 'Task', schema })
