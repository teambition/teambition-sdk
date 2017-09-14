import { RDBType, Relationship, SchemaDef } from 'reactivedb/interface'
import { schemas } from '../SDK'

import {
  UserId,
  ProjectId,
  TapDashboardId,
  ExecutorOrCreator,
  TapGenericFilterRequest as FilterRequest,
  TapGenericFilterResponse as FilterResponse
} from 'teambition-types'

import {
  TapChartType,
  TapChartSchema
} from './TapChart'

export interface TapDashboardSchema<T extends FilterRequest | FilterResponse> {
  _id: TapDashboardId

  _projectId: ProjectId

  _creatorId: UserId
  creator?: ExecutorOrCreator

  name: string
  cover: TapChartType

  filter: T
  tapcharts: TapChartSchema<T>[]
}

const schema: SchemaDef<TapDashboardSchema<FilterRequest | FilterResponse>> = {
  _id: {
    type: RDBType.STRING,
    primaryKey: true
  },

  _projectId: {
    type: RDBType.STRING
  },

  _creatorId: {
    type: RDBType.STRING
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

  name: {
    type: RDBType.STRING
  },
  cover: {
    type: RDBType.STRING
  },

  filter: {
    type: RDBType.OBJECT
  },
  tapcharts: {
    type: Relationship.oneToMany,
    virtual: {
      name: 'TapChart',
      where: (tapChartTable: any) => ({
        _id: tapChartTable._tapdashboardId
      })
    }
  }
}

schemas.push({ schema, name: 'TapDashboard' })
