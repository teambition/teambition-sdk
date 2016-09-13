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
  _boundToObjectId: string
  _creatorId: string
  _id: string
  action: string
  boundToObjectType: string
  content: {
    comment?: string
    attachments?: File[]
    voice?: string[]
    mentionsArray?: string[]
    mentions?: {
      [index: string]: string
    }
    attachmentsName?: string
    creator?: string
    note?: string
    linked?: {
      _id: string
      _projectId: string
      _objectId: string
      objectType: string
      title: string
      url: string
    }
  }
  created: number
  creator: ExecutorOrCreator
  rawAction: string
  rootId: string
  title: string
  isComment?: boolean
  icon?: string
  creatorName?: string
  creatorAvatar?: string
  comment?: string
  linked?: {
    _id?: string
  }
  locales?: Locales
}

@schemaName('Activity')
export default class Activity extends Schema<ActivityData> implements ActivityData {
  _boundToObjectId: string = undefined
  _creatorId: string = undefined
  _id: string = undefined
  action: string = undefined
  boundToObjectType: string = undefined
  content: {
    comment?: string
    attachments?: File[]
    mentionsArray?: string[]
    voice?: string[]
    mentions?: {[index: string]: string}
    attachmentsName?: string
    creator?: string
    note?: string
    linked?: {
      _id: string
      _projectId: string
      _objectId: string
      objectType: string
      title: string
      url: string
    }
  } = undefined
  created: number = undefined
  creator: ExecutorOrCreator = undefined
  rawAction: string = undefined
  rootId: string = undefined
  title: string = undefined
}
