import { SchemaDef, RDBType } from '../db'
import { OrganizationId, ProjectId, RoleId, UserId, CollectionId, ExecutorOrCreator } from 'teambition-types'

import { Role } from './CustomRole'
import { schemaColl } from './schemas'

export interface OrganizationDividerSchema {
  name: string
  pos: number
}

export interface OrganizationPaymentPlan {
  _objectId: OrganizationId
  expired: string
  isBasic: boolean
  isExceedMember: boolean
  isExpired: boolean
  isStrictExceedMember: boolean
  isTrialExpired: boolean
  membersCount: number
  objectType: 'organization'
  payType: string
  status: string
  trialExpired: string
  trialType: string
}

export interface OrganizationLicense {
  membersCount: number
  expired: string
  payType: 'org' | 'org:2' | 'base'
  isTrial: boolean
  isExpired: boolean
}

type OrganizationLicenseKey = 'currentLicense' | 'trialLicense' | 'payLicense'

export type OrganizationLicenseMap = Record<OrganizationLicenseKey, OrganizationLicense | null>

export interface OrganizationSchema {
  _creatorId: UserId
  _defaultCollectionId: CollectionId
  _defaultRoleId: RoleId | null
  _id: OrganizationId
  _ownerId?: UserId
  _roleId: RoleId
  background: string
  category: string
  created: string
  description: string
  dividers: OrganizationDividerSchema[]
  isExpired: boolean
  isPublic: boolean
  logo: string
  labels?: string[]
  licenseMap: OrganizationLicenseMap
  name: string
  owner?: ExecutorOrCreator
  pinyin: string
  plan: OrganizationPaymentPlan
  positions: string[]
  projectIds: ProjectId[]
  py: string
  staffTypes: string[]
  role: Role
  isBindDD: boolean
}

const Schema: SchemaDef<OrganizationSchema> = {
  _creatorId: { type: RDBType.STRING },
  _defaultCollectionId: { type: RDBType.STRING },
  _defaultRoleId: { type: RDBType.STRING },
  _id: { type: RDBType.STRING, primaryKey: true },
  _ownerId: { type: RDBType.STRING },
  _roleId: { type: RDBType.STRING },
  background: { type: RDBType.STRING },
  category: { type: RDBType.STRING },
  created: { type: RDBType.DATE_TIME },
  description: { type: RDBType.STRING },
  dividers: { type: RDBType.OBJECT },
  isExpired: { type: RDBType.BOOLEAN },
  isPublic: { type: RDBType.BOOLEAN },
  logo: { type: RDBType.STRING },
  labels: { type: RDBType.OBJECT },
  licenseMap: { type: RDBType.OBJECT },
  name: { type: RDBType.STRING },
  owner: { type: RDBType.OBJECT },
  pinyin: { type: RDBType.STRING },
  plan: { type: RDBType.OBJECT },
  positions: { type: RDBType.OBJECT },
  projectIds: { type: RDBType.LITERAL_ARRAY },
  py: { type: RDBType.STRING },
  role: { type: RDBType.OBJECT },
  staffTypes: { type: RDBType.OBJECT },
  isBindDD: { type: RDBType.BOOLEAN }
}

schemaColl.add({ name: 'Organization', schema: Schema })
