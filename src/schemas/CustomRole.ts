import { SchemaDef, RDBType } from 'reactivedb/interface'
import { schemas } from '../SDK'
import { CustomRoleId, OrganizationId, UserId } from 'teambition-types'

export interface CustomRoleSchema {
  _id: CustomRoleId
  name: string
  _creatorId: UserId
  _organizationId: OrganizationId
  updated: string
  created: string
  permissions: string[]
}

const schema: SchemaDef<CustomRoleSchema> = {
  _creatorId: {
    type: RDBType.STRING
  },
  _id: {
    type: RDBType.STRING,
    primaryKey: true
  },
  _organizationId: {
    type: RDBType.STRING
  },
  created: {
    type: RDBType.DATE_TIME
  },
  name: {
    type: RDBType.STRING
  },
  permissions: {
    type: RDBType.LITERAL_ARRAY
  },
  updated: {
    type: RDBType.DATE_TIME
  }
}

schemas.push({ schema, name: 'CustomRole' })
