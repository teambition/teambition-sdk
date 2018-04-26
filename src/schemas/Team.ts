'use strict'

import Member from './Member'
import { ISchema } from './schema'
import { UserId } from '../teambition'
import { OrganizationId } from '../teambition'
import { TeamId } from '../teambition'

export interface TeamData extends ISchema {
  _creatorId: UserId
  _id: TeamId
  _organizationId: OrganizationId
  _parentId?: TeamId | null
  created: string
  hasMembers: Member[]
  membersCount: number
  name: string
  parent?: TeamData | null
  pinyin: string
  pos: number
  projectsCount: number
  py: string
  style: string
  type: 'default' | '' | string
  updated: string
}
