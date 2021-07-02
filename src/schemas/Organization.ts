import { SchemaDef, RDBType } from '../db'
import { OrganizationId, ProjectId, RoleId, UserId, CollectionId, ExecutorOrCreator } from 'teambition-types'

import { Role } from './CustomRole'
import { schemaColl } from './schemas'

export interface OrganizationDividerSchema {
  name: string
  pos: number
}

/**
 * 付费类型
 * https://thoughts.teambition.com/workspaces/59bdd86a7fef2900012872a2/docs/5a1d1070671a3000014aa81d
 */
export enum OrganizationPaymentPlanType {
  /**
   * 免费版
   */
  Basic = 'basic',

  /**
   * 专业版
   */
  Pro = 'org',

  /**
   * 老企业版（专业版 + 无限人数）
   */
  Old = 'org:1',

  /**
   * 旗舰版（所有功能）
   */
  Unlimited = 'org:2',
}

export interface OrganizationPaymentPlan {
  /**
   * 付费主体
   */
  readonly _objectId: OrganizationId

  /**
   * 付费主体类型
   */
  readonly objectType: 'organization'

  /**
   * 付费类型
   * - `basic` 免费版
   * - `org` 专业版
   * - `org:1` 4990 老企业 + 无限人数版
   * - `org:2` 旗舰版
   * - `null | ""` 两个类型都等价 `org`
   */
  readonly payType: OrganizationPaymentPlanType | '' | null

  /**
   * 付费到期时间
   */
  readonly expired: string

  /**
   * 付费到期剩余天数
   */
  readonly days: number

  /**
   * 付费已到期（依据服务器时间）
   */
  readonly isExpired: boolean

  /**
   * 付费已到期，保留当前版本，限制 10 人使用
   */
  readonly isBasic: boolean

  /**
   * 试用类型
   * - `org` 专业版
   * - `org:2` 旗舰版
   */
  readonly trialType: OrganizationPaymentPlanType.Pro | OrganizationPaymentPlanType.Unlimited | ''

  /**
   * 试用到期时间
   */
  readonly trialExpired: string | null

  /**
   * 试用到期剩余天数
   */
  readonly trialDays: number | undefined

  /**
   * 试用已到期（依据服务器时间）
   */
  readonly isTrialExpired: boolean

  /**
   * 已经试用过哪些
   */
  readonly historyTrialTypes: Array<OrganizationPaymentPlanType.Pro | OrganizationPaymentPlanType.Unlimited>

  /**
   * 企业成员限额
   */
  readonly membersCount: number

  /**
   * 企业成员超额（软阻拦）
   */
  readonly isExceedMember: boolean

  /**
   * 企业成员超额（硬阻拦）
   */
  readonly isStrictExceedMember: boolean

  /**
   * 企业成员超额剩余天数
   */
  readonly exceedMemberLeftDays: number

  /**
   * 由个人专业版迁移而来
   */
  readonly createdFrom4990User: boolean
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
  staffTypes: { type: RDBType.OBJECT }
}

schemaColl.add({ name: 'Organization', schema: Schema })
