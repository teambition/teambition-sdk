import { RDBType, SchemaDef } from '../db'
import {
  BoardAxisType,
  ProjectId,
  SmartGroupId,
  SmartGroupViewType,
  SmartGroupPredefinedIcon,
  SmartGroupType,
  TaskSortMethod,
  TaskflowId,
  UserId,
  ScenarioFieldConfigId,
  SmartGroupViewTaskLayer,
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
    tableCellDescriptorList?: Array<{}> // 自定义视图表格视图默认排序依赖于该字段，具体请查阅相关代码
  },
  orderBy?: TaskSortMethod
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
  }
}

schemaColl.add({ name: 'SmartGroup', schema })
