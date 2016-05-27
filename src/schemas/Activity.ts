'use strict'
import { Schema, schemaName } from './schema'
import { MemberData } from '../teambition'
import File from './File'

@schemaName('Activity')
export default class Activity extends Schema {
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
