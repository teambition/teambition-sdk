import { SchemaDef, RDBType } from 'reactivedb/interface'
import { OrganizationId, ProjectId, RoleId, UserId } from 'teambition-types'
import { schemaColl } from './schemas'

export interface OrganizationDividerSchema {
  name: string
  pos: number
}

export interface OrganizationPaymentPlan {
  _objectId: OrganizationId
  expired: string
  isExpired: boolean
  isTrialExpired: boolean
  membersCount: number
  objectType: 'organization'
  payType: string
  status: string
  trialExpired: string
  trialType: string
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
  plan: OrganizationPaymentPlan
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

schemaColl.add({ name: 'Organization', schema: Schema })
