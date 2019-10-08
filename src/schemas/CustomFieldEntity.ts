import {
  CustomFieldId, CustomFieldEntityId,
  OrganizationId, ExecutorOrCreator, UserId
} from 'teambition-types'

import { CustomFieldSchema } from './CustomField'
import { CustomFieldChoiceSchema } from './CustomFieldChoice'
import { CustomFieldCascadingPayloadSchema } from './CustomFieldCascading'

export interface CustomFieldEntitySchema {
  _id: CustomFieldEntityId
  _customfieldId: CustomFieldId
  description: string
  choices: CustomFieldChoiceSchema[]
  customfield: CustomFieldSchema
  creator: ExecutorOrCreator
  _organizationId: OrganizationId
  _creatorId: UserId
  _modifierId: UserId
  modified: string
  modifier: ExecutorOrCreator
  created: string
  updated: string
  payload?: CustomFieldCascadingPayloadSchema
  projects: string[]
}
