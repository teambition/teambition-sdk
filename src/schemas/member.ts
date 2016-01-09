'use strict'
import {Schema, setSchema} from './schema'

export class Member extends Schema {
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

export const MemberSchema = setSchema(new Member())
