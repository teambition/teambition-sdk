'use strict'
import {
  IdOfMember,
  MemberId,
  ProjectId,
  OrganizationId,
  RoleId
} from 'teambition-types'
import { SchemaDef, RDBType } from 'reactivedb'
import { schemas } from '../SDK'

export interface MemberData {
  _boundToObjectId: ProjectId | OrganizationId
  _id: IdOfMember
  _memberId: MemberId
  _roleId: RoleId
  avatarUrl: string
  boundToObjectType: 'project' | 'organization'
  visited: string
  joined: string
  pushStatus: boolean
  nickname: string
  nicknamePy: string
  nicknamePinyin: string
  hasVisited: boolean
  phone: string
  location: string
  website: string
  latestActived: string
  isActive: boolean
  email: string
  name: string
  title: string
  pinyin: string
  py: string
}

const Schema: SchemaDef<MemberData> = {
  _id: {
    type: RDBType.STRING,
    primaryKey: true
  },
  _boundToObjectId: {
    type: RDBType.STRING
  },
  _memberId: {
    type: RDBType.STRING
  },
  _roleId: {
    type: RDBType.STRING
  },
  avatarUrl: {
    type: RDBType.STRING
  },
  boundToObjectType: {
    type: RDBType.STRING
  },
  visited: {
    type: RDBType.DATE_TIME
  },
  joined: {
    type: RDBType.DATE_TIME
  },
  pushStatus: {
    type: RDBType.STRING
  },
  nickname: {
    type: RDBType.STRING
  },
  nicknamePy: {
    type: RDBType.STRING
  },
  nicknamePinyin: {
    type: RDBType.STRING
  },
  hasVisited: {
    type: RDBType.BOOLEAN
  },
  phone: {
    type: RDBType.STRING
  },
  location: {
    type: RDBType.STRING
  },
  website: {
    type: RDBType.STRING
  },
  latestActived: {
    type: RDBType.DATE_TIME
  },
  isActive: {
    type: RDBType.BOOLEAN
  },
  email: {
    type: RDBType.STRING
  },
  name: {
    type: RDBType.STRING
  },
  title: {
    type: RDBType.STRING
  },
  pinyin: {
    type: RDBType.STRING
  },
  py: {
    type: RDBType.STRING
  }
}

schemas.push({ schema: Schema, name: 'Member' })
