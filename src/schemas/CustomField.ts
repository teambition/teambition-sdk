import { SchemaDef, RDBType } from 'reactivedb/interface'
import { schemaColl } from './schemas'
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

const schema: SchemaDef<CustomFieldSchema> = {
  _id: {
    type: RDBType.STRING,
    primaryKey: true
  },
  _creatorId: {
    type: RDBType.STRING
  },
  _organizationId: {
    type: RDBType.STRING
  },
  _projectId: {
    type: RDBType.STRING
  },
  _roleIds: {
    type: RDBType.LITERAL_ARRAY
  },
  boundType: {
    type: RDBType.STRING
  },
  choices: {
    type: RDBType.OBJECT
  },
  created: {
    type: RDBType.DATE_TIME
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
  updated: {
    type: RDBType.DATE_TIME
  },
}

schemaColl.add({ schema, name: 'CustomField' })
