'use strict'
import { Schema, ISchema, schemaName, bloodyParentWithProperty } from './schema'
import { ExecutorOrCreator } from '../teambition'

export interface FeedbackData extends ISchema {
  _id: string
  _creatorId: string
  content: {
    attachments?: string[]
    comment: string
    mentions?: {
      [index: string]: string
    }
  }
  _boundToObjectId: string
  boundToObjectType: string
  created: string
  updated: string
  creator?: ExecutorOrCreator
}

@schemaName('Feedback')
export default class FeedbackSchema extends Schema<FeedbackData> implements FeedbackData {
  _id: string = undefined
  _creatorId: string = undefined
  content: {
    attachments?: string[]
    comment: string
    mentions?: {
      [index: string]: string
    }
  } = undefined
  @bloodyParentWithProperty('boundToObjectType') _boundToObjectId: string = undefined
  boundToObjectType: string = undefined
  created: string = undefined
  updated: string = undefined
}
