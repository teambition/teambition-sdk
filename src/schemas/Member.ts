'use strict'
import {Schema, schemaName} from './schema'

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
