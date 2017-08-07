import { TapChartType } from './TapChart'
import { TapGenericFilterResponse } from 'teambition-types'

export interface QuestionId extends String {
  kind?: 'QuestionId'
}

export interface QuestionSchema {
  _id: QuestionId
  type: TapChartType

  name: string
  desc: string

  filter: TapGenericFilterResponse

  [index: string]: any
}
