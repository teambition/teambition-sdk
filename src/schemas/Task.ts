import { RDBType, Relationship, SchemaDef } from 'reactivedb/interface'
import { CustomFieldValue, ExecutorOrCreator, Reminder, Visibility } from 'teambition-types'
import {
  ProjectId,
  ScenarioFieldConfigId,
  SprintId,
  StageId,
  SubtaskId,
  TagId,
  TaskId,
  TasklistId,
  TaskPriority,
  UserId
} from 'teambition-types'
import { schemas } from '../SDK'
import { ProjectSchema } from './Project'
import { StageSchema } from './Stage'
import { TagSchema } from './Tag'

export interface TaskSchema {
  _id: TaskId
  content: string
  note: string
  accomplished: string
  ancestorIds: TaskId[]
  startDate: string
  dueDate: string
  priority: TaskPriority
  isDone: boolean
  isArchived: boolean
  isDeleted: boolean
  created: string
  updated: string
  visible: Visibility
  _sprintId?: SprintId
  _stageId: StageId
  _creatorId: UserId
  _tasklistId: TasklistId
  _projectId: ProjectId
  _executorId: UserId
  _scenariofieldconfigId?: ScenarioFieldConfigId
  involveMembers: UserId[]
  tagIds: TagId []
  tags?: Array<Pick<TagSchema, '_id' | 'name' | 'color'>>
  recurrence: string[]
  pos: number
  _sourceId: string
  sourceDate: string
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
  _taskId: TaskId // id of the parent task
  parent: Pick<TaskSchema, '_id' | '_creatorId' | '_executorId' | 'content' | 'isDone'>
  progress: number
  rating: 0 | 1 | 2 | 3 | 4 | 5
  stage: Pick<StageSchema, '_id' | 'name'>
  storyPoint: string
  tasklist?: {
    _id: TasklistId
    title: string
  }
  type: 'task'
  isFavorite: boolean,
  project: Pick<ProjectSchema, '_id' | 'name'>,
  uniqueId: number
  url: string
  workTime: {
    totalTime: number
    usedTime: number
    unit: string
  }
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
  _scenariofieldconfigId: {
    type: RDBType.STRING
  },
  _sprintId: {
    type: RDBType.STRING
  },
  _sourceId: {
    type: RDBType.STRING
  },
  _stageId: {
    type: RDBType.STRING
  },
  _taskId: {
    type: RDBType.STRING
  },
  _tasklistId: {
    type: RDBType.STRING
  },
  accomplished: {
    type: RDBType.DATE_TIME
  },
  ancestorIds: {
    type: RDBType.LITERAL_ARRAY
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
      name: 'User',
      where: (userTable: any) => ({
        _executorId: userTable._id
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
  parent: {
    type: Relationship.oneToOne,
    virtual: {
      name: 'Task',
      where: (taskTable: any) => ({
        _taskId: taskTable._id
      })
    }
  },
  pos: {
    type: RDBType.NUMBER
  },
  priority: {
    type: RDBType.NUMBER
  },
  progress: {
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
  rating: {
    type: RDBType.NUMBER
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
  storyPoint: {
    type: RDBType.STRING
  },
  subtaskCount: {
    type: RDBType.NUMBER
  },
  subtaskIds: {
    type: RDBType.LITERAL_ARRAY
  },
  tagIds: {
    type: RDBType.LITERAL_ARRAY
  },
  tags: {
    type: RDBType.OBJECT
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
  },
  workTime: {
    type: RDBType.OBJECT
  }
}

schemas.push({ name: 'Task', schema })
