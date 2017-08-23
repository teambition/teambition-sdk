import { SchemaDef, RDBType } from 'reactivedb/interface'
import { OrganizationId, ProjectId, RoleId, UserId } from 'teambition-types'
import { schemas } from '../SDK'

export interface OrganizationDividerSchema {
  name: string
  pos: number
}

export interface OrganizationPlanSchema {
  created?: string
  days: number
  expired: string
  firstPaidTime?: string
  free?: boolean
  lastPaidTime?: string
  membersCount: number
  updated?: string
}

export interface OrganizationSchema {
  _creatorId: UserId
  _defaultRoleId: RoleId | null
  _id: OrganizationId
  _roleId: RoleId
  background: string
  category: string
  created: string
  description: string
  dividers: OrganizationDividerSchema[]
  isPublic: boolean
  logo: string
  name: string
  pinyin: string
  plan: OrganizationPlanSchema
  positions: string[]
  projectIds: ProjectId[]
  py: string
  staffTypes: string[]
}

const Schema: SchemaDef<OrganizationSchema> = {
  _creatorId: { type: RDBType.STRING },
  _defaultRoleId: { type: RDBType.STRING },
  _id: { type: RDBType.STRING, primaryKey: true },
  _roleId: { type: RDBType.STRING },
  background: { type: RDBType.STRING },
  category: { type: RDBType.STRING },
  created: { type: RDBType.DATE_TIME },
  description: { type: RDBType.STRING },
  dividers: { type: RDBType.OBJECT },
  isPublic: { type: RDBType.BOOLEAN },
  logo: { type: RDBType.STRING },
  name: { type: RDBType.STRING },
  pinyin: { type: RDBType.STRING },
  plan: { type: RDBType.OBJECT },
  positions: { type: RDBType.OBJECT },
  projectIds: { type: RDBType.LITERAL_ARRAY },
  py: { type: RDBType.STRING },
  staffTypes: { type: RDBType.OBJECT },
}

schemas.push({ name: 'Organization', schema: Schema })
