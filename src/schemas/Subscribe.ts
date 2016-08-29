import { ISchema, Schema, schemaName } from './schema'

export type SubscribeType = 'report' | 'canlender'

export interface SubscribeData extends ISchema {
  _id: string
  _userId: string
  type: SubscribeType
  body: {
    projects: {
      _id: string
      name: string
      logo: string
      py: string
      pinyin: string
    }[]
    users: {
      _id: string
      avatarUrl: string
      name: string
      pinyin: string
      py: string
    }[]
    _boundToObjectId: string
  }
  updated: string
  created: string
  name: string
}

@schemaName('Subscribe')
export default class SubscribeSchema extends Schema<SubscribeData> implements SubscribeData {
  _id: string = undefined
  _userId: string = undefined
  type: SubscribeType = undefined
  body: {
    projects: {
      _id: string
      name: string
      logo: string
      py: string
      pinyin: string
    }[]
    users: {
      _id: string
      avatarUrl: string
      name: string
      pinyin: string
      py: string
    }[]
    _boundToObjectId: string
  } = undefined
  updated: string = undefined
  created: string = undefined
  name: string = undefined
}
