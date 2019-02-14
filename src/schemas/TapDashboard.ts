import { RDBType, SchemaDef } from '../db'
import { schemaColl } from './schemas'

import {
  ProjectId,
  TapChartId,
  TapDashboardId,
  TapSelectSection,
  TapDashboardSection,
  TapGenericFilterRequest as FilterRequest,
  TapGenericFilterResponse as FilterResponse
} from 'teambition-types'

import {
  TapGraphData
} from './TapChart'

export type TapDashboardDisplay = {
  layout: 'folder' | 'details'
  visible: boolean
  dependency?: string[]
}

export type TapCoordSize = 'small' | 'mid' | 'large'

export interface TapCoordination {
  _objectId: TapDashboardId | TapChartId
  order?: number
  size?: TapCoordSize
}

export type TapExhibit =  'big' | 'small'

export interface TapDashboard<T extends FilterRequest | FilterResponse> {
  _id: TapDashboardId
  _projectId: ProjectId

  name: string
  desc: string
  exhibit: TapExhibit
  sections: TapDashboardSection[]
  selectedSection: TapSelectSection

  filter: T

  graphData: TapGraphData[]
}

const schema: SchemaDef<TapDashboard<FilterRequest | FilterResponse>> = {
  _id: {
    type: RDBType.STRING,
    primaryKey: true
  },

  _projectId: {
    type: RDBType.STRING
  },

  name: {
    type: RDBType.STRING
  },

  desc: {
    type: RDBType.STRING
  },

  exhibit: {
    type: RDBType.STRING
  },

  sections: {
    type: RDBType.OBJECT
  },

  selectedSection: {
    type: RDBType.OBJECT
  },

  filter: {
    type: RDBType.OBJECT
  },

  graphData: {
    type: RDBType.OBJECT
  }
}

schemaColl.add({ schema, name: 'TapDashboard' })
