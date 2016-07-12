'use strict'
import { Schema, schemaName, ISchema } from './schema'
import { MemberData } from '../schemas/Member'
import File from './File'

export interface ActivityData extends ISchema<ActivityData> {
  _id: string
  action: string
  rawAction: string
  created: number
  boundToObjectType: string
  _boundToObjectId: string
  creator: MemberData
  title: string
  content: {
    comment?: string
    attachments: File[]
    mentionsArray: string[]
    mentions: MemberData
    attachmentsName: string
    creator: string
      linked?: {
      _id: string
      _projectId: string
      _objectId: string
      objectType: string
      title: string
    }
  }
  isComment: boolean
  icon: string
  creatorName: string
  creatorAvatar: string
  comment: string
  linked: {
    _id?: string
  }
}

@schemaName('Activity')
export default class Activity extends Schema implements ActivityData {
  _id: string = undefined
  action: string = undefined
  rawAction: string = undefined
  created: number = undefined
  boundToObjectType: string = undefined
  _boundToObjectId: string = undefined
  creator: MemberData = undefined
  title: string = undefined
  content: {
    comment?: string
    attachments: File[]
    mentionsArray: string[]
    mentions: MemberData
    attachmentsName: string
    creator: string
      linked?: {
      _id: string
      _projectId: string
      _objectId: string
      objectType: string
      title: string
    }
  } = undefined
  isComment: boolean = undefined
  icon: string = undefined
  creatorName: string = undefined
  creatorAvatar: string = undefined
  comment: string = undefined
  linked: {
    _id?: string
  } = undefined
}
