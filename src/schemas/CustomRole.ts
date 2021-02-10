import { SchemaDef, RDBType } from '../db'
import { schemaColl } from './schemas'
import { CustomRoleSchema, Role } from 'teambition-types'

export { CustomRoleSchema, Role }

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
  _projectId: {
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
  },
  isDefault: {
    type: RDBType.BOOLEAN
  },
  level: {
    type: RDBType.NUMBER
  }
}

schemaColl.add({ schema, name: 'CustomRole' })
