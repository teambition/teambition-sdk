import { RDBType, SchemaDef } from 'reactivedb/interface'
import {
  ProjectId,
  UserId,
  SmartGroupId,
  SmartGroupViewType,
  SwimAxisLane,
  SmartGroupPredefinedIcon,
  SmartGroupType,
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
    vertical: SwimAxisLane
    horizontal: SwimAxisLane
  },
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
