import { SchemaDef, RDBType, Relationship } from 'reactivedb/interface'
import { schemaColl } from './schemas'
import { CustomFieldType, CustomFieldBoundType, CustomFieldCategoryId, AdvancedCustomField, UserSnippet } from 'teambition-types'
import { CustomFieldId, OrganizationId, ProjectId, RoleId, UserId, AdvancedCustomFieldId } from 'teambition-types'

import { CustomFieldChoiceSchema } from './CustomFieldChoice'

export interface CustomFieldSchema {
  _advancedCustomfieldId: AdvancedCustomFieldId
  _creatorId: UserId
  _id: CustomFieldId
  _lockerId: UserId | null
  _organizationId: OrganizationId
  _projectId?: ProjectId
  _roleIds: RoleId[]
  advancedCustomfield: AdvancedCustomField
  boundType: CustomFieldBoundType
  categoryIds: CustomFieldCategoryId[]
  choices: CustomFieldChoiceSchema[]
  created: string
  creator?: UserSnippet
  description: string
  displayed: boolean
  externalUrl?: string
  isLocked: boolean
  isSingleSelection?: boolean
  locker: UserSnippet | null
  name: string
  pos: number
  projects?: string[]
  type: CustomFieldType
  updated: string
}

const schema: SchemaDef<CustomFieldSchema> = {
  _id: {
    type: RDBType.STRING,
    primaryKey: true
  },
  _advancedCustomfieldId: {
    type: RDBType.STRING
  },
  _creatorId: {
    type: RDBType.STRING
  },
  _lockerId: {
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
  advancedCustomfield: {
    type: RDBType.OBJECT
  },
  boundType: {
    type: RDBType.STRING
  },
  categoryIds: {
    type: RDBType.LITERAL_ARRAY
  },
  choices: {
    type: RDBType.OBJECT
  },
  created: {
    type: RDBType.DATE_TIME
  },
  creator: {
    type: Relationship.oneToOne,
    virtual: {
      name: 'User',
      where: (userTable: any) => ({
        _creatorId: userTable._id
      })
    }
  },
  description: {
    type: RDBType.STRING
  },
  displayed: {
    type: RDBType.BOOLEAN
  },
  externalUrl: {
    type: RDBType.STRING
  },
  isLocked: {
    type: RDBType.BOOLEAN
  },
  isSingleSelection: {
    type: RDBType.BOOLEAN
  },
  locker: {
    type: Relationship.oneToOne,
    virtual: {
      name: 'User',
      where: (userTable: any) => ({
        _lockerId: userTable._id
      })
    }
  },
  name: {
    type: RDBType.STRING
  },
  pos: {
    type: RDBType.NUMBER
  },
  projects: {
    type: RDBType.OBJECT
  },
  type: {
    type: RDBType.STRING
  },
  updated: {
    type: RDBType.DATE_TIME
  },
}

schemaColl.add({ schema, name: 'CustomField' })
