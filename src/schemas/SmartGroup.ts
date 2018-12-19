import { RDBType, SchemaDef } from 'reactivedb/interface'
import {
  ProjectId,
  UserId,
  SmartGroupId,
  SmartGroupViewType,
  SwimAxisLane,
  SmartGroupType,
} from 'teambition-types'
import { schemaColl } from './schemas'

export enum SmartGroupPredefinedIcon {
  TaskToday = 'taskToday',
  TaskUndone = 'taskUndone',
  TaskDone = 'taskDone',
  TaskNotAssigned = 'taskNotAssigned',
  TaskMyExecuted = 'taskMyExecuted'
}

export enum TaskSortMethod {
  CUSTOM = 'custom',
  PRIORITY = 'priority',
  STARTDATE = 'startdate',
  STARTDATE_DESC = 'startdate_desc',
  DUEDATE = 'duedate',
  CREATED_ASC = 'created_asc',
  CREATED_DESC = 'created_desc',
}

export interface SmartGroupSchema {
  _id: SmartGroupId
  _projectId: ProjectId
  _creatorId: UserId
  name: string
  description: string
  icon: SmartGroupPredefinedIcon | null
  type?: SmartGroupType
  view: {
    type: SmartGroupViewType
    vertical?: SwimAxisLane
    horizontal?: SwimAxisLane
  },
  orderBy: TaskSortMethod
  filter: string
  created: string
  updated: string
}

const schema: SchemaDef<SmartGroupSchema> = {
  _id: {
    type: RDBType.STRING,
    primaryKey: true,
  },
  _creatorId: {
    type: RDBType.STRING,
  },
  _projectId: {
    type: RDBType.STRING,
  },
  created: {
    type: RDBType.DATE_TIME,
  },
  description: {
    type: RDBType.STRING,
  },
  icon: {
    type: RDBType.STRING,
  },
  filter: {
    type: RDBType.STRING,
  },
  name: {
    type: RDBType.STRING,
  },
  orderBy: {
    type: RDBType.STRING,
  },
  type: {
    type: RDBType.STRING,
  },
  updated: {
    type: RDBType.DATE_TIME,
  },
  view: {
    type: RDBType.OBJECT,
  }
}

schemaColl.add({ name: 'SmartGroup', schema })
