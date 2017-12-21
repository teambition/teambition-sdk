import { RDBType, SchemaDef } from 'reactivedb/interface'
import { schemaColl } from './schemas'
import {
  TeamId,
  UserId,
  OrganizationId,
  UserSnippet,
  TeamMemberStatus
} from 'teambition-types'

export interface TeamSchema {
  _creatorId: UserId
  _id: TeamId
  _leaderId: UserId | null
  _organizationId: OrganizationId
  _parentId?: TeamId | null
  created: string
  hasMembers: Array<UserSnippet & {
    isDisabled: boolean,
    teams: TeamId[]
  }>,
  leader: UserSnippet & { status: TeamMemberStatus } | null
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

const schema: SchemaDef<TeamSchema> = {
  _id: {
    type: RDBType.STRING,
    primaryKey: true
  },
  _creatorId: {
    type: RDBType.STRING
  },
  _leaderId: {
    type: RDBType.STRING
  },
  _organizationId: {
    type: RDBType.STRING
  },
  _parentId: {
    type: RDBType.STRING
  },
  created: {
    type: RDBType.STRING
  },
  hasMembers: {
    type: RDBType.OBJECT
  },
  leader: {
    type: RDBType.OBJECT
  },
  membersCount: {
    type: RDBType.NUMBER
  },
  name: {
    type: RDBType.STRING
  },
  parent: {
    type: RDBType.OBJECT
  },
  pinyin: {
    type: RDBType.STRING
  },
  pos: {
    type: RDBType.NUMBER
  },
  projectsCount: {
    type: RDBType.NUMBER
  },
  py: {
    type: RDBType.STRING
  },
  style: {
    type: RDBType.STRING
  },
  type: {
    type: RDBType.STRING
  },
  updated: {
    type: RDBType.STRING
  }
}

schemaColl.add({ schema, name: 'Team' })
