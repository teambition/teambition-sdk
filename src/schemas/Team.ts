'use strict'

import Member from './Member'
import { ISchema } from './schema'
import { IdOfMember } from '../teambition'
import { OrganizationId } from '../teambition'
import { Schema } from './schema'
import { TeamId } from '../teambition'
import { schemaName } from './schema'

export interface TeamData extends ISchema {
  _creatorId: IdOfMember
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
