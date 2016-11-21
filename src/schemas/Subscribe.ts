import { ISchema, Schema, schemaName } from './schema'
import {
  SubscribeId,
  OrganizationId,
  UserId,
  ProjectId
} from '../teambition'

export type SubscribeType = 'report' | 'canlender'

export interface SubscribeData extends ISchema {
  _id: SubscribeId
  _userId: UserId
  type: SubscribeType
  body: {
    projects: {
      _id: ProjectId
      name: string
      logo: string
      py: string
      pinyin: string
      created: string
    }[]
    users: {
      _id: UserId
      avatarUrl: string
      name: string
      pinyin: string
      py: string
    }[]
    _boundToObjectId: ProjectId | OrganizationId
  }
  updated: string
  created: string
  name: string
}

@schemaName('Subscribe')
export default class SubscribeSchema extends Schema<SubscribeData> implements SubscribeData {
  _id: SubscribeId = undefined
  _userId: UserId = undefined
  type: SubscribeType = undefined
  body: {
    projects: {
      _id: ProjectId
      name: string
      logo: string
      py: string
      pinyin: string
      created: string
    }[]
    users: {
      _id: UserId
      avatarUrl: string
      name: string
      pinyin: string
      py: string
    }[]
    _boundToObjectId: ProjectId | OrganizationId
  } = undefined
  updated: string = undefined
  created: string = undefined
  name: string = undefined
}
