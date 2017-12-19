import { SchemaDef, RDBType } from 'reactivedb/interface'
import { schemaColl } from './schemas'
import { CustomFieldType } from 'teambition-types'
import { CustomFieldId, CustomFieldLinkId, ProjectId, RoleId } from 'teambition-types'

import { CustomFieldChoiceSchema } from './CustomFieldChoice'

export interface CustomFieldLinkSchema {
  _customfieldId: CustomFieldId
  _id: CustomFieldLinkId
  _projectId: ProjectId
  _roleIds: RoleId[]
  choices: CustomFieldChoiceSchema[]
  displayed: boolean
  name: string
  pos: number
  type: CustomFieldType
}

const schema: SchemaDef<CustomFieldLinkSchema> = {
  _id: {
    type: RDBType.STRING,
    primaryKey: true
  },
  _customfieldId: {
    type: RDBType.STRING
  },
  _projectId: {
    type: RDBType.STRING
  },
  _roleIds: {
    type: RDBType.LITERAL_ARRAY
  },
  choices: {
    type: RDBType.OBJECT
  },
  displayed: {
    type: RDBType.BOOLEAN
  },
  name: {
    type: RDBType.STRING
  },
  pos: {
    type: RDBType.NUMBER
  },
  type: {
    type: RDBType.STRING
  },
}

schemaColl.add({ schema, name: 'CustomFieldLink' })
