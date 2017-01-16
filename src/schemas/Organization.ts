'use strict'
import {
  OrganizationId,
  ProjectId,
  RoleId,
  IdOfMember
} from 'teambition-types'
import { SchemaDef, RDBType } from 'reactivedb'
import { schemas } from '../SDK'

export interface OrganizationData {
  _id: OrganizationId
  name: string
  _creatorId: IdOfMember
  logo: string
  description: string
  category: string
  pinyin: string
  py: string
  isPublic: boolean
  dividers: {
    name: string
    pos: number
  }[]
  projectIds: ProjectId[]
  created: string
  background: string
  plan: {
    lastPaidTime?: string
    firstPaidTime?: string
    updated?: string
    created?: string
    expired: string
    free?: boolean
    membersCount: number
    days: number
  }
  _defaultRoleId: RoleId | null
  _roleId: RoleId
}

const Schema: SchemaDef<OrganizationData> = {
  _creatorId: {
    type: RDBType.STRING
  },
  _defaultRoleId: {
    type: RDBType.STRING
  },
  _id: {
    type: RDBType.STRING,
    primaryKey: true
  },
  _roleId: {
    type: RDBType.STRING
  },
  background: {
    type: RDBType.STRING
  },
  category: {
    type: RDBType.STRING
  },
  created: {
    type: RDBType.DATE_TIME
  },
  description: {
    type: RDBType.STRING
  },
  dividers: {
    type: RDBType.OBJECT
  },
  isPublic: {
    type: RDBType.BOOLEAN
  },
  logo: {
    type: RDBType.STRING
  },
  name: {
    type: RDBType.STRING
  },
  pinyin: {
    type: RDBType.STRING
  },
  plan: {
    type: RDBType.OBJECT
  },
  projectIds: {
    type: RDBType.LITERAL_ARRAY
  },
  py: {
    type: RDBType.STRING
  }
}

export default schemas.push({ name: 'Organization', schema: Schema })
