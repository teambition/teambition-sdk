import { MemberSchema } from './Member'
import { TeamId, UserId, OrganizationId } from 'teambition-types'

export interface TeamSchema {
  _creatorId: UserId
  _id: TeamId
  _organizationId: OrganizationId
  _parentId?: TeamId | null
  created: string
  hasMembers: MemberSchema[]
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
