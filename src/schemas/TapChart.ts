import { RDBType, Relationship, SchemaDef } from 'reactivedb/interface'
import { schemaColl } from './schemas'
import { Moment } from 'moment'

import {
  UserId,
  TapChartId,
  TapDashboardId,
  ExecutorOrCreator,
  TapGenericFilterRequest as FilterRequest,
  TapGenericFilterResponse as FilterResponse
} from 'teambition-types'

export type TapChartType = 'line' | 'bar' | 'linebar' | 'pie' | 'number' | 'table' | 'details'

// tapGraph definition
export type TapGraphColType = 'type/Date' | 'type/DateTime' | 'type/Integer' | 'type/String'

export interface TapGraphCol {
  name: string
  baseType: TapGraphColType
}

export type TapGraphData = {
  cols: TapGraphCol[],
  rows: any[][]
}

export interface TapGraphNullableDimDisplay {
  nullDimension?: false | string,
  nullAs?: 'zero' | 'nothing' | 'interpolation'
}

export interface TapGraphStackDisplay {
  stack: false | 'stack'
}

export interface TapGraphCoordGridDisplay {
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
    },
    y1?: {
      visible: boolean
      scale: 'linear'
      label: string | null
      range: 'auto'
      linkedTo?: 'y'
    }
  }
  // should be filled by client
  // restriction: axes.x.scale should be 'timeseries' when weekends provided
  weekends?: Moment[][]
}

export interface TapGraphLineDisplay extends TapGraphCoordGridDisplay, TapGraphStackDisplay, TapGraphNullableDimDisplay {
  showPointMarker: boolean,
}

export interface TapGraphBarDisplay extends TapGraphCoordGridDisplay, TapGraphStackDisplay, TapGraphNullableDimDisplay {
  colorSequence?: string[] | 'v2'
}

export interface TapGraphPieDisplay {
  showLegend: boolean
  sectorCapacity?: number
  colorPreset?: string
}

export type TapGraphLineBarPreset = {
  name: 'burnup'
  colorScheme: 'blue'
  idealLineCol: number
  actualLineCol: number
  scopeLineCol: number
  barColumns: number[]
} | {
  name: 'burndown'
  colorScheme: 'blue'
  idealLineCol: number
  actualLineCol: number
  barColumns: number[]
} | {
  name: 'generic'
  colorScheme: 'blue'
  barColumns: number[]
  lineColumns: number[]
}

export interface TapGraphLineBarDisplay extends TapGraphCoordGridDisplay, TapGraphNullableDimDisplay {
  preset: TapGraphLineBarPreset
  barYAxis: 'y' | 'y1'
  lineYAxis: 'y' | 'y1'
}

export interface TapGraphNumberDisplay {
  showTitle: boolean
  multiplyBy?: number
  prefix?: string
  suffix?: string
  circleColor?: string
}

export interface TapGraphTableDisplay {
  columOrder?: number[]
}

export interface TapGraphDetailsDisplay extends TapGraphTableDisplay {
  idColumn: number
  typeColumn: number
  preset: string
}

export type TapDisplaySet = TapGraphLineDisplay | TapGraphBarDisplay | TapGraphPieDisplay | TapGraphLineBarDisplay |
                            TapGraphNumberDisplay | TapGraphTableDisplay | TapGraphDetailsDisplay

export type TapGraphVisualizationSettings<T extends TapChartType, D extends TapDisplaySet> = {
  type: T
  dimension: number // key of cols in data
  display: D
}

export type TapGraphVisualizationSettingsSet =
  TapGraphVisualizationSettings<'bar', TapGraphBarDisplay> |
  TapGraphVisualizationSettings<'line', TapGraphLineDisplay> |
  TapGraphVisualizationSettings<'pie', TapGraphPieDisplay> |
  TapGraphVisualizationSettings<'linebar', TapGraphLineBarDisplay> |
  TapGraphVisualizationSettings<'number', TapGraphNumberDisplay> |
  TapGraphVisualizationSettings<'table', TapGraphTableDisplay> |
  TapGraphVisualizationSettings<'details', TapGraphDetailsDisplay>

// tapChart definition
export interface TapChart<T extends FilterRequest | FilterResponse> {
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
  visualizationSettings: TapGraphVisualizationSettingsSet
}

const schema: SchemaDef<TapChart<FilterRequest | FilterResponse>> = {
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

schemaColl.add({ schema, name: 'TapChart' })
