import { SchemaDef, RDBType, Relationship } from 'reactivedb/interface'
import { schemaColl } from './schemas'
import { CustomFieldType, CustomFieldBoundType, AdvancedCustomField, CustomFieldSubtype, UserId, UserSnippet } from 'teambition-types'
import { CustomFieldId, CustomFieldLinkId, ProjectId, RoleId, CustomFieldCategoryId } from 'teambition-types'

import { CustomFieldChoiceSchema } from './CustomFieldChoice'

export interface CustomFieldLinkBaseSchema {
  _customfieldId: CustomFieldId
  _id: CustomFieldLinkId
  _lockerId: UserId | null
  _projectId: ProjectId
  _roleIds: RoleId[]
  advancedCustomfield: AdvancedCustomField | null
  boundType: CustomFieldBoundType
  categoryIds: CustomFieldCategoryId[]
  choices: CustomFieldChoiceSchema[]
  description: string
  displayed: boolean
  externalUrl?: string // 可能字段不存在
  isLocked: boolean
  locker: UserSnippet | null
  name: string
  pos: number
  type: CustomFieldType
}

export interface NormalCustomFieldLinkSchema extends CustomFieldLinkBaseSchema {
  isLinkLocked?: boolean
  type: Exclude<CustomFieldType, 'commongroup'>
}

export interface CommonGroupCustomFieldLinkSchema extends CustomFieldLinkBaseSchema {
  type: 'commongroup'
  subtype: CustomFieldSubtype
}

export type CustomFieldLinkSchema = NormalCustomFieldLinkSchema | CommonGroupCustomFieldLinkSchema

const schema: SchemaDef<CustomFieldLinkSchema> = {
  _id: {
    type: RDBType.STRING,
    primaryKey: true
  },
  _customfieldId: {
    type: RDBType.STRING
  },
  _lockerId: {
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
  description: {
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
  displayed: {
    type: RDBType.BOOLEAN
  },
  externalUrl: {
    type: RDBType.STRING
  },
  isLinkLocked: {
    type: RDBType.BOOLEAN
  },
  isLocked: {
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
  type: {
    type: RDBType.STRING
  },
  subtype: {
    type: RDBType.STRING
  }
}

schemaColl.add({ schema, name: 'CustomFieldLink' })
