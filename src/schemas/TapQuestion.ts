import { TapChartType } from './TapChart'
import { TapGenericFilterResponse } from 'teambition-types'

export interface TapQuestionId extends String {
  kind?: 'QuestionId'
}

export interface TapQuestion {
  _id: TapQuestionId
  type: TapChartType

  name: string
  desc: string

  filter: TapGenericFilterResponse

  [index: string]: any
}
