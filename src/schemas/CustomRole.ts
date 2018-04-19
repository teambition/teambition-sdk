import { SchemaDef, RDBType } from 'reactivedb/interface'
import { schemaColl } from './schemas'
import { CustomRoleId, CustomRoleType, OrganizationId, UserId } from 'teambition-types'

export interface CustomRoleSchema<T extends CustomRoleType = CustomRoleType> {
  _id: CustomRoleId
  name: string
  _creatorId: UserId
  _organizationId: OrganizationId
  updated: string
  created: string
  permissions: string[]
  type: T
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
  type: {
    type: RDBType.STRING
  },
  updated: {
    type: RDBType.DATE_TIME
  }
}

schemaColl.add({ schema, name: 'CustomRole' })
