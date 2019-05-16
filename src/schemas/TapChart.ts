import { RDBType, SchemaDef } from '../db'
import { Moment } from 'moment'

import {
  TaskId,
  ProjectId,
  TapChartId,
  TapChartName,
  TapDataSettings,
  TapDimensionType,
  TapSelectSection,
  TapDashboardSection,
  TapChartType as TapChoiceChartType,
  TapGenericFilterRequest as FilterRequest,
  TapGenericFilterResponse as FilterResponse
} from 'teambition-types'

export type TapChartType = 'line' | 'bar' | 'linebar' | 'pie' | 'number' | 'table' | 'details' | 'overview' | 'customset'

// tapGraph definition
export type TapGraphColType = 'type/Date' | 'type/DateTime' | 'type/Integer' | 'type/String' | 'type/Task'

export type TapChartExhibitType = 'small' | 'big'

export interface TapGraphCol {
  name: string
  baseType: TapGraphColType
}

export type TapGraphData = {
  name: TapChartName
  title: string
  cols: TapGraphCol[];
  rows: any[][];
  taskIds: TaskId[][][];
  visualizationSettings: TapGraphVisualizationSettingsSet;
}

export interface TapGraphNullableDimDisplay {
  nullDimension?: false | string,
  nullAs?: 'zero' | 'nothing' | 'interpolation'
}

export interface TapGraphStackDisplay {
  stack: false | 'stack'
}

export interface TapGraphChartTypeDisplay {
  colorPreset?: 'pieTheme'
  chartType?: 'bugTaskflow'
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

export interface TapGraphBarDisplay extends TapGraphCoordGridDisplay, TapGraphStackDisplay, TapGraphNullableDimDisplay, TapGraphChartTypeDisplay {
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

export interface TapGraphOverviewDisplay {

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
  TapGraphVisualizationSettings<'details', TapGraphDetailsDisplay> |
  TapGraphVisualizationSettings<'overview', TapGraphOverviewDisplay> |
  TapGraphVisualizationSettings<'customset', TapGraphOverviewDisplay>

// tapChart definition
export interface TapChart<T extends FilterRequest | FilterResponse> {

  _id: TapChartId

  settings?: TapDataSettings

  _projectId: ProjectId

  chartType: TapChoiceChartType

  analysis_dimension?: TapDimensionType | null

  compare_dimension?: TapDimensionType | null

  exhibit: TapChartExhibitType

  sections: TapDashboardSection[]
  selectedSection: TapSelectSection

  report: TapChartName

  name: string
  desc: string

  filter: T

  type: 'tdr' | 'udr'

  graphData: TapGraphData[]
}

export const schema: SchemaDef<TapChart<FilterRequest | FilterResponse>> = {

  _id: {
    type: RDBType.STRING,
    primaryKey: true
  },

  _projectId: {
    type: RDBType.STRING
  },

  analysis_dimension: {
    type: RDBType.OBJECT
  },

  chartType: {
    type: RDBType.STRING
  },

  compare_dimension: {
    type: RDBType.OBJECT
  },

  desc: {
    type: RDBType.STRING
  },

  exhibit: {
    type: RDBType.STRING
  },

  filter: {
    type: RDBType.OBJECT
  },

  graphData: {
    type: RDBType.OBJECT
  },

  name: {
    type: RDBType.STRING
  },

  type: {
    type: RDBType.STRING
  },

  report: {
    type: RDBType.STRING
  },

  selectedSection: {
    type: RDBType.STRING
  },

  sections: {
    type: RDBType.OBJECT
  }

}

// schemaColl.add({ schema, name: 'TapChart' })
