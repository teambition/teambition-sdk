import { RDBType, SchemaDef, Relationship } from '../db'
import {
  BoardAxisType,
  ProjectId,
  SmartGroupId,
  SmartGroupViewType,
  SmartGroupViewVisibilityType,
  SmartGroupPredefinedIcon,
  SmartGroupType,
  TaskSortMethod,
  TaskflowId,
  UserId,
  ScenarioFieldConfigId,
  SmartGroupViewTaskLayer,
  ExecutorOrCreator,
} from 'teambition-types'
import { schemaColl } from './schemas'

export interface SmartGroupSchema {
  _id: SmartGroupId
  _projectId: ProjectId
  _creatorId: UserId
  name: string
  description: string
  icon: SmartGroupPredefinedIcon | null
  taskCount?: {
    total: number
  }
  type?: SmartGroupType
  view: {
    type: SmartGroupViewType
    vertical?: BoardAxisType
    horizontal?: BoardAxisType
    _verticalIds?: ScenarioFieldConfigId[]
    _horizontalId?: TaskflowId
    taskLayer?: SmartGroupViewTaskLayer
  },
  orderBy?: TaskSortMethod
  filter: string
  creator: ExecutorOrCreator
  created: string
  updated: string
  visibility: SmartGroupViewVisibilityType
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
  creator: {
    type: Relationship.oneToOne,
    virtual: {
      name: 'User',
      where: (userTable: any) => ({
        _creatorId: userTable._id
      })
    }
  },
  description: {
    type: RDBType.STRING,
  },
  filter: {
    type: RDBType.STRING,
  },
  icon: {
    type: RDBType.STRING,
  },
  name: {
    type: RDBType.STRING,
  },
  orderBy: {
    type: RDBType.STRING,
  },
  taskCount: {
    type: RDBType.OBJECT,
  },
  type: {
    type: RDBType.STRING,
  },
  updated: {
    type: RDBType.DATE_TIME,
  },
  view: {
    type: RDBType.OBJECT,
  },
  visibility: {
    type: RDBType.STRING,
  },
}

schemaColl.add({ name: 'SmartGroup', schema })
