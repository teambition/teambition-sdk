import { TapChartType } from './TapChart'
import { TapGenericFilterResponse } from 'teambition-types'

export type TapQuestionId = string & { kind: 'TapQuestionId' }

export interface TapQuestion {
  _id: TapQuestionId
  type: TapChartType

  name: string
  desc: string

  filter: TapGenericFilterResponse

  [index: string]: any
}
