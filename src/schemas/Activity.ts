'use strict'
import {
  ExecutorOrCreator,
  ActivityId,
  DetailObjectTypes,
  DetailObjectId
} from 'teambition-types'

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

export interface Voice {
  source: string
  fileType: 'amr'
  fileCategory: string
  fileName: string
  thumbnailUrl: string
  previewUrl: string
  mimeType: string
  downloadUrl: string
  fileSize: number
  duration: number
  fileKey: string
  thumbnail: string
}

export interface ActivityData {
  _boundToObjectId: DetailObjectId
  _creatorId: string
  _id: ActivityId
  action: string
  boundToObjectType: DetailObjectTypes
  content: {
    comment: string
    content: string
    attachments: File[]
    voice: Voice
    mentionsArray: string[]
    mentions: {
      [index: string]: string
    }
    attachmentsName: string
    creator: string
    executor: string
    note: string
    subtask: string
    count: string
    dueDate: string
    linked: {
      _id: string
      _projectId: string
      _objectId: string
      objectType: string
      title: string
      url: string
    }
    linkedCollection: {
      _id: string
      title: string
      objectType: 'collection'
    }
    uploadWorks: {
      _id: string
      fileName: string
      objectType: 'work'
    }[]
    collection: {
      _id: string
      title: string
      objectType: 'collection'
    }
    work: {
      _id: string
      fileName: string
      objectType: 'work'
    }
  }
  created: number
  creator: ExecutorOrCreator
  rawAction: string
  rootId: string
  title: string
  isComment: boolean
  icon: string
  creatorName: string
  creatorAvatar: string
  comment: string
  linked: {
    _id: string
  }
  locales: Locales
}
