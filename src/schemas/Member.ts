'use strict'
import { Schema, schemaName, ISchema } from './schema'
import {
  UserId,
  MemberId,
  ProjectId,
  OrganizationId,
  RoleId,
  TeamId
} from '../teambition'
import { ProjectData } from './Project'
import { UserPaymentPlan } from './UserMe'
import { TeamData } from './Team'

export interface MemberProfile {
  _id: string
  birthday?: string
  city?: string
  country?: string
  email?: string
  entryTime?: string
  name?: string
  phone?: string
  pinyin?: string
  position?: string
  province?: string
  py?: string
  staffType?: string
  teamIds?: TeamId[]
}

export interface MemberData extends ISchema {
  _boundToObjectId: ProjectId | OrganizationId
  _id: MemberId
  _memberId: MemberId
  _roleId: RoleId
  _userId: UserId
  avatarUrl: string
  birthday?: string
  boundToObjectType: 'project' | 'organization'
  email: string
  hasVisited: boolean
  invited?: string
  isActive: boolean
  isDisabled: boolean
  isOrgMember?: boolean
  isRobot: boolean
  joined: string
  latestActived: string
  location: string
  name: string
  nickname: string
  nicknamePinyin?: string
  nicknamePy?: string
  phone?: string
  pinyin: string
  plan: UserPaymentPlan
  profile: MemberProfile
  projectExperience?: Array<Pick<ProjectData,
  | '_id'
  | 'name'
  | 'description'
  | 'logo'
  | 'pinyin'
  | 'py'
  | 'isPublic'
  > & { modelType: 'project' }>
  projectExperienceIds: ProjectId[]
  pushStatus: boolean
  py: string
  teams: TeamId[]
  teamsInfo: TeamData[]
  title: string
  visited: string | null
  website: string
}

@schemaName('Member')
export default class Member extends Schema<MemberData> implements MemberData {
  _boundToObjectId: ProjectId | OrganizationId = undefined
  _id: MemberId = undefined
  _memberId: MemberId = undefined
  _roleId: RoleId = undefined
  _userId: UserId = undefined
  avatarUrl: string = undefined
  birthday?: string
  boundToObjectType: 'project' | 'organization' = undefined
  email: string = undefined
  hasVisited: boolean = undefined
  invited?: string
  isActive: boolean = undefined
  isDisabled: boolean = undefined
  isOrgMember?: boolean
  isRobot: boolean = undefined
  joined: string = undefined
  latestActived: string = undefined
  location: string = undefined
  name: string = undefined
  nickname: string = undefined
  nicknamePinyin?: string
  nicknamePy?: string
  phone?: string
  pinyin: string = undefined
  plan: UserPaymentPlan = undefined
  profile: MemberProfile = undefined
  projectExperience?: MemberData['projectExperience']
  projectExperienceIds: ProjectId[] = undefined
  pushStatus: boolean = undefined
  py: string = undefined
  teams: TeamId[] = undefined
  teamsInfo: TeamData[] = undefined
  title: string = undefined
  visited: string | null = undefined
  website: string = undefined
}
