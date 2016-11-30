'use strict'
import { Schema, schemaName, ISchema, bloodyParent } from './schema'
import {
  GroupId,
  UserId,
  OrganizationId
} from '../teambition'

export interface GroupData extends ISchema {
  _creatorId: UserId
  _id: GroupId
  _organizationId: OrganizationId
  created: string
  hasMembers: {
    _id: UserId
    _userId: UserId
    avatarUrl: string
    email: string
    isDefaultEmail: boolean
    isDisabled: boolean
    name: string
    pinyin: string
    py: string
    title: string
  }[]
  membersCount: number
  name: string
  pinyin: string
  py: string
  updated: string
}

@schemaName('Group')
export default class GroupSchema extends Schema<GroupData> implements GroupData {
  _creatorId: UserId = undefined
  _id: GroupId = undefined
  @bloodyParent('Organization') _organizationId: OrganizationId = undefined
  created: string = undefined
  hasMembers: {
    _id: UserId
    _userId: UserId
    avatarUrl: string
    email: string
    isDefaultEmail: boolean
    isDisabled: boolean
    name: string
    pinyin: string
    py: string
    title: string
  }[] = undefined
  membersCount: number = undefined
  name: string = undefined
  pinyin: string = undefined
  py: string = undefined
  updated: string = undefined
}
