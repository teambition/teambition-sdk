import { SchemaDef, RDBType, Relationship } from '../db'
import { schemaColl } from './schemas'
import { ExecutorOrCreator, ActivityId, DetailObjectTypes, DetailObjectId, UserId } from 'teambition-types'

export interface Locales {
  en: {
    title: string
  }
  zh: {
    title: string
  }
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

export interface Share {
  isShareObject: boolean
  obj_id: string
  url: string
  type: string
  _type: string
  imgUrl: string
  title: string
  fileName: string
  fileType: string
  thumbnail: string
  mobileShareLink: string
  description: string
}

export interface ActivitySchema {
  _boundToObjectId: DetailObjectId
  _creatorId: UserId
  _id: ActivityId
  action: string
  boundToObjectType: DetailObjectTypes
  content: {
    robotsource?: string
    comment: string
    content: string
    attachments: File[]
    voice: Voice
    mentionsArray: string[]
    mentions: {
      [index: string]: string
    }
    share: Share
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
    renderMode?: 'markdown' | 'text'
  }
  created: number
  creator: ExecutorOrCreator
  rawAction: string
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

const schema: SchemaDef<ActivitySchema> = {
  _boundToObjectId: {
    type: RDBType.STRING
  },
  _creatorId: {
    type: RDBType.STRING
  },
  _id: {
    type: RDBType.STRING,
    primaryKey: true
  },
  action: {
    type: RDBType.STRING
  },
  boundToObjectType: {
    type: RDBType.STRING
  },
  content: {
    type: RDBType.OBJECT
  },
  created: {
    type: RDBType.DATE_TIME
  },
  creator: {
    type: Relationship.oneToOne,
    virtual: {
      name: 'User',
      where: (userTable: any) => ({
        _creatorId: userTable._id
      })
    }
  },
  rawAction: {
    type: RDBType.STRING
  },
  title: {
    type: RDBType.STRING
  },
  isComment: {
    type: RDBType.BOOLEAN
  },
  icon: {
    type: RDBType.STRING
  },
  creatorName: {
    type: RDBType.STRING
  },
  creatorAvatar: {
    type: RDBType.STRING
  },
  comment: {
    type: RDBType.STRING
  },
  linked: {
    type: RDBType.OBJECT
  },
  locales: {
    type: RDBType.OBJECT
  }
}

schemaColl.add({ schema, name: 'Activity' })
