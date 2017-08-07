import {
  SubscribeId,
  OrganizationId,
  UserId,
  ProjectId
} from 'teambition-types'

export type SubscribeType = 'report' | 'canlender'

export interface SubscribeSchema {
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
