'use strict'
import { Schema, ISchema, schemaName, bloodyParentWithProperty } from './schema'
import {
  ExecutorOrCreator,
  FeedbackId,
  UserId,
  FileId,
  ProjectId
} from '../teambition'

export interface FeedbackData extends ISchema {
  _id: FeedbackId
  _creatorId: UserId
  content: {
    attachments?: FileId[]
    comment: string
    mentions?: {
      [index: string]: string
    }
  }
  _boundToObjectId: ProjectId
  boundToObjectType: 'project'
  created: string
  updated: string
  creator?: ExecutorOrCreator
}

@schemaName('Feedback')
export default class FeedbackSchema extends Schema<FeedbackData> implements FeedbackData {
  _id: FeedbackId = undefined
  _creatorId: UserId = undefined
  content: {
    attachments?: FileId[]
    comment: string
    mentions?: {
      [index: string]: string
    }
  } = undefined
  @bloodyParentWithProperty('boundToObjectType') _boundToObjectId: ProjectId = undefined
  boundToObjectType: 'project' = undefined
  created: string = undefined
  updated: string = undefined
}
