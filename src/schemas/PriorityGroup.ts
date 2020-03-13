import { PriorityOptionId, OrganizationId, PriorityGroupId, UserId, PriorityOptionValue } from 'teambition-types'
import { SchemaDef, RDBType } from 'reactivedb'
import { schemaColl } from './schemas'

export interface PriorityGroupSchema {
  _id: PriorityGroupId
  _organizationId: OrganizationId
  name: string
  _defaultOptionId: PriorityOptionId
  created: string
  updated: string
  _creatorId: UserId
  options: PriorityOption[]
}

export interface PriorityOption {
  _id: PriorityOptionId
  name: string
  value: PriorityOptionValue
  color: string
}

const schema: SchemaDef<PriorityGroupSchema> = {
  _id: {
    type: RDBType.STRING,
    primaryKey: true,
  },
  _organizationId: {
    type: RDBType.STRING,
  },
  name: {
    type: RDBType.STRING,
  },
  _defaultOptionId: {
    type: RDBType.STRING
  },
  created: {
    type: RDBType.DATE_TIME,
  },
  updated: {
    type: RDBType.DATE_TIME,
  },
  _creatorId: {
    type: RDBType.STRING,
  },
  options: {
    type: RDBType.OBJECT
  }
}

schemaColl.add({ name: 'PriorityGroup', schema })
