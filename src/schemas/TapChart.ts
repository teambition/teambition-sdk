import { RDBType, Relationship, SchemaDef } from 'reactivedb/interface'
import { schemas } from '../SDK'

import {
  UserId,
  TapChartId,
  TapDashboardId,
  ExecutorOrCreator,
  TapGenericFilterRequest as FilterRequest,
  TapGenericFilterResponse as FilterResponse
} from 'teambition-types'

export type TapChartType = 'bar' | 'line'

// tapGraph definition
export type TapGraphColType = 'type/DateTime' | 'type/Integer' | 'type/String'

export interface TapGraphCol {
  name: string
  baseType: TapGraphColType
}

export type TapGraphData = {
  cols: TapGraphCol[],
  rows: any[][]
}

export type TapGraphLineDisplay = {
  showPointMarker: boolean,
  stack: false | 'stack'
}

export type TapGraphBarDisplay = {
  stack: false | 'stack'
}

export type TapGraphVisualizationSettings = {
  type: TapChartType
  dimension: number // key of cols in data
  display: TapGraphLineDisplay | TapGraphBarDisplay
  axes: {
    x: {
      visible: boolean
      label: string | null
      scale: 'timeseries' | 'ordinal'
    },
    y: {
      visible: boolean
      scale: 'linear'
      label: string | null
      range: 'auto'
    }
  }
}

// tapChart definition
export interface TapChartSchema<T extends FilterRequest | FilterResponse> {
  _id: TapChartId

  _creatorId: UserId
  creator?: ExecutorOrCreator

  _tapdashboardId: TapDashboardId
  tapdashboard?: {
    _id: TapDashboardId,
    name: string
  }

  name: string
  desc: string

  created: string
  updated: string

  filter: T
  filterList: FilterResponse

  graphData: TapGraphData
  visualizationSettings: TapGraphVisualizationSettings
}

const schema: SchemaDef<TapChartSchema<FilterRequest | FilterResponse>> = {
  _id: {
    type: RDBType.STRING,
    primaryKey: true
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

  _tapdashboardId: {
    type: RDBType.STRING
  },
  tapdashboard: {
    type: Relationship.oneToOne,
    virtual: {
      name: 'TapDashboard',
      where: (dashboardTable: any) => ({
        _tapdashboardId: dashboardTable._id
      })
    }
  },

  name: {
    type: RDBType.STRING
  },
  desc: {
    type: RDBType.STRING
  },

  created: {
    type: RDBType.DATE_TIME
  },
  updated: {
    type: RDBType.DATE_TIME
  },

  filter: {
    type: RDBType.OBJECT
  },
  filterList: {
    type: RDBType.OBJECT
  },

  graphData: {
    type: RDBType.OBJECT
  },
  visualizationSettings: {
    type: RDBType.OBJECT
  }
}

schemas.push({ schema, name: 'TapChart' })
