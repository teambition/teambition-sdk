import { SchemaDef, RDBType } from '../db'
import { schemaColl } from './schemas'
import { CustomRoleId, CustomRoleType, OrganizationId, ProjectId, UserId } from 'teambition-types'

export interface CustomRoleSchema<T extends CustomRoleType = CustomRoleType> {
  _id: CustomRoleId
  name: string
  _creatorId: UserId
  _organizationId: OrganizationId
  _projectId?: ProjectId
  updated: string
  created: string
  isDefault: boolean
  level: number
  permissions: string[]
  type: T
}

export type Role = CustomRoleSchema<'project' | 'organization'>

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
