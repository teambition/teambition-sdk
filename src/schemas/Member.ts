'use strict'
import { Schema, schemaName, ISchema } from './schema'
import {
  UserId,
  MemberId,
  ProjectId,
  OrganizationId,
  RoleId
} from '../teambition'

export interface MemberData extends ISchema {
  _id: UserId
  _boundToObjectId: ProjectId | OrganizationId
  boundToObjectType: 'project' | 'organization'
  _roleId: RoleId
  visited: string
  joined: string
  pushStatus: boolean
  nickname: string
  nicknamePy: string
  nicknamePinyin: string
  hasVisited: boolean
  _memberId: MemberId
  phone: string
  location: string
  website: string
  latestActived: string
  isActive: boolean
  email: string
  name: string
  avatarUrl: string
  title: string
  pinyin: string
  py: string
}

@schemaName('Member')
export default class Member extends Schema<MemberData> implements MemberData {
  _id: UserId = undefined
  _boundToObjectId: ProjectId | OrganizationId = undefined
  boundToObjectType: 'project' | 'organization' = undefined
  _roleId: RoleId = undefined
  visited: string = undefined
  joined: string = undefined
  pushStatus: boolean = undefined
  nickname: string = undefined
  nicknamePy: string = undefined
  nicknamePinyin: string = undefined
  hasVisited: boolean = undefined
  _memberId: MemberId = undefined
  phone: string = undefined
  location: string = undefined
  website: string = undefined
  latestActived: string = undefined
  isActive: boolean = undefined
  email: string = undefined
  name: string = undefined
  avatarUrl: string = undefined
  title: string = undefined
  pinyin: string = undefined
  py: string = undefined
}
