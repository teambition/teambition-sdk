import { RDBType, SchemaDef } from 'reactivedb/interface'
import {
  ProjectId,
  UserId,
  SmartGroupId,
  SmartGroupViewType,
  SwimAxisLane,
} from 'teambition-types'
import { schemas } from '../SDK'

export interface SmartGroupSchema {
  _id: SmartGroupId
  _projectId: ProjectId
  _creatorId: UserId
  name: string
  description: string
  type?: 'story' | 'sprint' | 'bug'
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
  filter: {
    type: RDBType.STRING,
  },
  name: {
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

schemas.push({ name: 'SmartGroup', schema })
