import { RDBType, Relationship, SchemaDef } from '../db'
import { CustomFieldValue, ExecutorOrCreator, Reminder, VisibleOption, OrganizationId, TaskDivisionType } from 'teambition-types'
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
  TaskflowStatusId,
  UserId
} from 'teambition-types'
import { schemaColl } from './schemas'
import { ProjectSchema } from './Project'
import { ScenarioFieldConfigSchema } from './ScenarioFieldConfig'
import { SprintSchema } from './Sprint'
import { StageSchema } from './Stage'
import { TagSchema } from './Tag'
import { TaskflowStatusSnippet } from './TaskflowStatus'

export interface TaskSchema {
  _id: TaskId
  content: string
  note: string
  accomplished: string
  ancestorIds: TaskId[]
  ancestors?: Pick<TaskSchema, '_id' | 'content'>[]
  startDate: string | null
  divisions?: TaskDivisionType[]
  dueDate: string | null
  priority: TaskPriority
  isDone: boolean
  isArchived: boolean
  isDeleted: boolean
  created: string
  creator?: ExecutorOrCreator
  updated: string
  visible: VisibleOption
  _organizationId: OrganizationId | null
  _sprintId?: SprintId
  _stageId: StageId
  _creatorId: UserId
  _tasklistId: TasklistId
  _projectId: ProjectId | null
  _executorId: UserId | null
  _scenariofieldconfigId?: ScenarioFieldConfigId
  _taskflowstatusId?: TaskflowStatusId
  involveMembers: UserId[]
  tagIds: TagId[]
  tags?: Array<Pick<TagSchema, '_id' | 'name' | 'color'>>
  recurrence: string[] | null
  pos: number
  _sourceId: string
  sourceDate: string | null
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
  executor: ExecutorOrCreator | null
  _taskId: TaskId // id of the parent task
  parent: Pick<TaskSchema, '_id' | '_creatorId' | '_executorId' | 'content' | 'isDone'>
  progress: number
  rating: 0 | 1 | 2 | 3 | 4 | 5
  stage: Pick<StageSchema, '_id' | 'name' | 'order'>
  storyPoint: string
  sprint?: SprintSchema
  taskflowstatus?: TaskflowStatusSnippet | null
  tasklist?: {
    _id: TasklistId
    title: string
  }
  objectType: 'task'
  type: 'task' // todo(dingwen): deprecate
  isFavorite: boolean,
  project?: Pick<ProjectSchema, '_id' | 'name' | 'uniqueIdPrefix'>,
  scenariofieldconfig?: Pick<ScenarioFieldConfigSchema, '_id' | 'icon' | 'name'>,
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
  _taskflowstatusId: {
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
  _organizationId: {
    type: RDBType.STRING
  },
  accomplished: {
    type: RDBType.DATE_TIME
  },
  ancestorIds: {
    type: RDBType.LITERAL_ARRAY
  },
  ancestors: {
    type: RDBType.OBJECT
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
  creator: {
    type: Relationship.oneToOne,
    virtual: {
      name: 'User',
      where: (userTable: any) => ({
        _creatorId: userTable._id
      })
    }
  },
  customfields: {
    type: RDBType.OBJECT
  },
  divisions: {
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
  objectType: {
    type: RDBType.STRING
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
  scenariofieldconfig: {
    type: Relationship.oneToOne,
    virtual: {
      name: 'ScenarioFieldConfig',
      where: (scenariofieldconfigTable: any) => {
        return { _scenariofieldconfigId: scenariofieldconfigTable._id }
      }
    }
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
  sprint: {
    type: Relationship.oneToOne,
    virtual: {
      name: 'Sprint',
      where: (sprintTable: any) => {
        return { _sprintId: sprintTable._id }
      }
    }
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
  taskflowstatus: {
    type: Relationship.oneToOne,
    virtual: {
      name: 'TaskflowStatus',
      where: (taskflowStatusTable: any) => ({
        _taskflowstatusId: taskflowStatusTable._id
      })
    }
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

schemaColl.add({ name: 'Task', schema })
