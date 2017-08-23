import { CustomFieldType } from 'teambition-types'
import { CustomFieldId, CustomFieldLinkId, ProjectId, RoleId } from 'teambition-types'

import { CustomFieldChoiceSchema } from './CustomFieldChoice'

export interface CustomFieldLinkSchema {
  _customfieldId: CustomFieldId
  _id: CustomFieldLinkId
  _projectId: ProjectId
  _roleIds: RoleId[]
  choices: CustomFieldChoiceSchema[]
  name: string
  pos: number
  type: CustomFieldType
}
