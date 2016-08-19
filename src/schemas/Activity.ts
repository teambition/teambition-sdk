'use strict'
import { Schema, schemaName, ISchema } from './schema'
import File from './File'
import { ExecutorOrCreator } from '../teambition'

export interface Locales {
  en: {
    title: string
  }
  zh: {
    title: string
  },
  ko: {
    title: string
  }
  zh_tw: {
    title: string
  }
  ja: {
    title: string
  }
}

export interface ActivityData extends ISchema {
  _id: string
  action: string
  rawAction: string
  created: number
  boundToObjectType: string
  _boundToObjectId: string
  creator: ExecutorOrCreator
  title: string
  content: {
    comment?: string
    attachments: File[]
    mentionsArray: string[]
    mentions: {
      [index: string]: string
    }
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
  locales: Locales
}

@schemaName('Activity')
export default class Activity extends Schema<ActivityData> implements ActivityData {
  _id: string = undefined
  action: string = undefined
  rawAction: string = undefined
  created: number = undefined
  boundToObjectType: string = undefined
  _boundToObjectId: string = undefined
  creator: ExecutorOrCreator = undefined
  title: string = undefined
  content: {
    comment?: string
    attachments: File[]
    mentionsArray: string[]
    mentions: {[index: string]: string}
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
  locales: Locales = undefined
}
