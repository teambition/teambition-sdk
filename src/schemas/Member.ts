'use strict'
import { Schema, schemaName, ISchema } from './schema'

export interface MemberData extends ISchema<MemberData> {
  _id: string
  _boundToObjectId: string
  boundToObjectType: string
  _roleId: number
  visited: string
  joined: string
  pushStatus: boolean
  nickname: string
  nicknamePy: string
  nicknamePinyin: string
  hasVisited: boolean
  _memberId: string
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
export default class Member extends Schema {
  _id: string = undefined
  _boundToObjectId: string = undefined
  boundToObjectType: string = undefined
  _roleId: number = undefined
  visited: string = undefined
  joined: string = undefined
  pushStatus: boolean = undefined
  nickname: string = undefined
  nicknamePy: string = undefined
  nicknamePinyin: string = undefined
  hasVisited: boolean = undefined
  _memberId: string = undefined
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
