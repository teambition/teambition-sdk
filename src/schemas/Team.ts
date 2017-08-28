import { MemberSchema } from './Member'
import {
  TeamId,
  UserId,
  OrganizationId,
  ExecutorOrCreator,
  TeamMemberStatus
} from 'teambition-types'

export interface TeamSchema {
  _creatorId: UserId
  _id: TeamId
  _leaderId: UserId | null
  _organizationId: OrganizationId
  _parentId?: TeamId | null
  created: string
  hasMembers: MemberSchema[]
  leader: ExecutorOrCreator & { status: TeamMemberStatus } | null
  membersCount: number
  name: string
  parent?: TeamSchema | null
  pinyin: string
  pos: number
  projectsCount: number
  py: string
  style: string
  type: 'default' | '' | string
  updated: string
}
