import { SchemaDef, RDBType, Relationship } from '../db'
import { schemaColl } from './schemas'
import { CustomFieldType, CustomFieldBoundType, CustomFieldCategoryId, AdvancedCustomField, UserSnippet, CustomFieldSubtype } from 'teambition-types'
import {
  CustomFieldId, OrganizationId, ProjectId, RoleId, UserId,
  AdvancedCustomFieldId, CustomFieldRelevantSetting,
  ApplicationId,
} from 'teambition-types'

import { CustomFieldChoiceSchema } from './CustomFieldChoice'
import { CustomFieldCascadingPayloadSchema } from './CustomFieldCascading'

export interface CustomFieldSchema {
  _advancedCustomfieldId: AdvancedCustomFieldId
  _boundToObjectId: ApplicationId
  _creatorId: UserId
  _id: CustomFieldId
  _lockerId: UserId | null
  _organizationId: OrganizationId
  _projectId?: ProjectId
  _roleIds: RoleId[]
  advancedCustomfield: AdvancedCustomField
  boundToObjectType: 'app'
  boundType: CustomFieldBoundType
  categoryIds: CustomFieldCategoryId[]
  choices: CustomFieldChoiceSchema[]
  created: string
  creator?: UserSnippet
  description: string
  displayed: boolean
  externalUrl?: string
  fieldName?: string // 应用自定义字段
  isLocked: boolean
  isSingleSelection?: boolean
  locker: UserSnippet | null
  name: string
  payload?: CustomFieldCascadingPayloadSchema
  pos: number
  projects?: string[]
  setting?: CustomFieldRelevantSetting
  source?: string // 应用自定义字段
  subtype?: CustomFieldSubtype // 仅当 需求分类/缺陷分类 才有
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
  _boundToObjectId: {
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
  boundToObjectType: {
    type: RDBType.STRING
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
  fieldName: {
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
  payload: {
    type: RDBType.OBJECT
  },
  pos: {
    type: RDBType.NUMBER
  },
  setting: {
    type: RDBType.OBJECT
  },
  projects: {
    type: RDBType.OBJECT
  },
  source: {
    type: RDBType.STRING
  },
  subtype: {
    type: RDBType.STRING
  },
  type: {
    type: RDBType.STRING
  },
  updated: {
    type: RDBType.DATE_TIME
  },
}

schemaColl.add({ schema, name: 'CustomField' })
