import { SchemaDef, RDBType, Relationship } from '../db'
import { schemaColl } from './schemas'
import {
  CustomFieldType, CustomFieldBoundType, AdvancedCustomField,
  CustomFieldSubtype, UserId, UserSnippet, MemberIdentityId
} from 'teambition-types'
import {
  CustomFieldId, CustomFieldLinkId, ProjectId, RoleId, CustomFieldCategoryId,
  CustomFieldEntityId, CustomFieldRelevantSetting
} from 'teambition-types'

import { CustomFieldChoiceSchema } from './CustomFieldChoice'

export interface CustomFieldLinkBaseSchema {
  _customfieldId: CustomFieldId
  _customfieldentityId?: CustomFieldEntityId
  _id: CustomFieldLinkId
  _lockerId: UserId | null
  _projectId: ProjectId
  _roleIds: RoleId[]
  allowedMemberIdentityIds: MemberIdentityId[]  // 编辑权限成员角色白名单
  advancedCustomfield: AdvancedCustomField | null
  boundType: CustomFieldBoundType
  categoryIds: CustomFieldCategoryId[]
  choices: CustomFieldChoiceSchema[]
  description: string
  displayed: boolean
  externalUrl?: string // 可能字段不存在
  isLinkLocked?: boolean
  isLocked: boolean
  isSingleSelection?: boolean
  locker: UserSnippet | null
  name: string
  pos: number
  setting?: CustomFieldRelevantSetting
  type: CustomFieldType
  payload?: any
}

export interface NormalCustomFieldLinkSchema extends CustomFieldLinkBaseSchema {
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
  _customfieldentityId: {
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
  allowedMemberIdentityIds: {
    type: RDBType.LITERAL_ARRAY,
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
  setting: {
    type: RDBType.OBJECT
  },
  type: {
    type: RDBType.STRING
  },
  subtype: {
    type: RDBType.STRING
  },
  payload: {
    type: RDBType.OBJECT
  }
}

schemaColl.add({ schema, name: 'CustomFieldLink' })
