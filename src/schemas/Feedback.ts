import {
  ExecutorOrCreator,
  FeedbackId,
  UserId,
  FileId,
  ProjectId
} from 'teambition-types'

export interface FeedbackSchema {
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
