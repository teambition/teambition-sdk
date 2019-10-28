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

enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

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
    tableCellDescriptorList?: Array<{}> // 自定义视图表格视图默认排序依赖于该字段，具体请查阅相关代码
    tableSortBy?: {  // 具体参考自定义视图表格视图 sortBy 字段
      key: string
      order: SortOrder
    }
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
