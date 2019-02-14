import { RDBType, SchemaDef } from '../db'
import { CustomFieldCategoryId, UserId, OrganizationId } from 'teambition-types'
import { schemaColl } from './schemas'

export interface CustomFieldCategorySchema {
  _id: CustomFieldCategoryId
  _creatorId: UserId
  _organizationId: OrganizationId
  created: string
  isDeleted: boolean
  name: string
  updated: string
}

const schema: SchemaDef<CustomFieldCategorySchema> = {
  _id: {
    type: RDBType.STRING,
    primaryKey: true,
  },
  _creatorId: {
    type: RDBType.STRING
  },
  _organizationId: {
    type: RDBType.STRING
  },
  created: {
    type: RDBType.DATE_TIME
  },
  isDeleted: {
    type: RDBType.BOOLEAN
  },
  name: {
    type: RDBType.STRING
  },
  updated: {
    type: RDBType.DATE_TIME
  }
}

schemaColl.add({ name: 'CustomFieldCategory', schema })
