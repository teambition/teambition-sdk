import { CustomFieldChoiceId } from 'teambition-types'

export interface CustomFieldChoiceSchema {
  _id: CustomFieldChoiceId
  value: string
  isRoot?: boolean
}
