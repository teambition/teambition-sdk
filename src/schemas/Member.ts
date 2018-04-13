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

export interface MemberProfile {
  birthday: string
  city: string
  country: string
  email: string
  entryTime: string
  name: string
  phone: string
  position: string
  province: string
  staffType: string
  teamIds: TeamId[]
}

export interface MemberData extends ISchema {
  _boundToObjectId: ProjectId | OrganizationId
  _id: MemberId
  _memberId: MemberId
  _roleId: RoleId
  _userId: UserId
  avatarUrl: string
  boundToObjectType: 'project' | 'organization'
  email: string
  hasVisited: boolean
  isActive: boolean
  isDisabled: boolean
  invited: string
  joined: string
  latestActived: string
  location: string
  name: string
  nickname: string
  nicknamePinyin: string
  nicknamePy: string
  phone: string
  pinyin: string
  plan: UserPaymentPlan
  profile: MemberProfile
  projectExperience: ProjectData[]
  projectExperienceIds: ProjectId[]
  pushStatus: boolean
  py: string
  teams: TeamId[]
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
  boundToObjectType: 'project' | 'organization' = undefined
  email: string = undefined
  hasVisited: boolean = undefined
  isActive: boolean = undefined
  isDisabled: boolean = undefined
  invited: string = undefined
  joined: string = undefined
  latestActived: string = undefined
  location: string = undefined
  name: string = undefined
  nickname: string = undefined
  nicknamePinyin: string = undefined
  nicknamePy: string = undefined
  phone: string = undefined
  pinyin: string = undefined
  plan: UserPaymentPlan = undefined
  profile: MemberProfile = undefined
  projectExperience: ProjectData[] = undefined
  projectExperienceIds: ProjectId[] = undefined
  pushStatus: boolean = undefined
  py: string = undefined
  teams: TeamId[] = undefined
  title: string = undefined
  visited: string | null = undefined
  website: string = undefined
}
