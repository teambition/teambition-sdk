import { CustomFieldType, CustomFieldBoundType } from 'teambition-types'
import { CustomFieldId, OrganizationId, ProjectId, RoleId, UserId } from 'teambition-types'

import { CustomFieldChoiceSchema } from './CustomFieldChoice'

export interface CustomFieldSchema {
  _creatorId: UserId
  _id: CustomFieldId
  _organizationId: OrganizationId
  _projectId?: ProjectId
  _roleIds: RoleId[]
  boundType: CustomFieldBoundType
  choices: CustomFieldChoiceSchema[]
  created: string
  displayed: boolean
  name: string
  pos: number
  type: CustomFieldType
  updated: string
}
