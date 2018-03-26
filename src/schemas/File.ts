import { SchemaDef, Relationship, RDBType } from 'reactivedb/interface'
import { schemaColl } from './schemas'
import { ObjectLinkSchema } from './ObjectLink'
import {
  FileId,
  CollectionId,
  TagId,
  ProjectId,
  UserId,
  VisibleOption,
  ExecutorOrCreator,
  OrganizationId
} from 'teambition-types'

export interface FileSchema {
  _id: FileId
  fileName: string
  fileType: string
  fileSize: number
  fileKey: string
  fileCategory: string
  imageWidth: number
  imageHeight: number
  _organizationId: OrganizationId | null
  _parentId: CollectionId
  _projectId: ProjectId | null
  _creatorId: UserId
  creator: ExecutorOrCreator
  tagIds: TagId[]
  visible: VisibleOption
  downloadUrl: string
  thumbnail: string
  thumbnailUrl: string
  description: string
  source: string
  involveMembers: string[]
  created: string
  updated: string
  lastVersionTime: string
  lastUploaderId: UserId
  isArchived: boolean
  previewUrl: string
  shareStatus: number
  attachmentsCount: number
  commentsCount: number
  objectlinksCount: number
  pinyin: string
  py: string
  class: string
  isFavorite: boolean
  linked: ObjectLinkSchema[]
}

const schema: SchemaDef<FileSchema> = {
  _creatorId: {
    type: RDBType.STRING
  },
  _id: {
    type: RDBType.STRING,
    primaryKey: true
  },
  _organizationId: {
    type: RDBType.STRING
  },
  _parentId: {
    type: RDBType.STRING
  },
  _projectId: {
    type: RDBType.STRING
  },
  attachmentsCount: {
    type: RDBType.STRING
  },
  class: {
    type: RDBType.STRING
  },
  commentsCount: {
    type: RDBType.NUMBER
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
  description: {
    type: RDBType.STRING
  },
  downloadUrl: {
    type: RDBType.STRING
  },
  fileCategory: {
    type: RDBType.STRING
  },
  fileKey: {
    type: RDBType.STRING
  },
  fileName: {
    type: RDBType.STRING
  },
  fileSize: {
    type: RDBType.NUMBER
  },
  fileType: {
    type: RDBType.STRING
  },
  imageHeight: {
    type: RDBType.NUMBER
  },
  imageWidth: {
    type: RDBType.NUMBER
  },
  involveMembers: {
    type: RDBType.LITERAL_ARRAY
  },
  isArchived: {
    type: RDBType.BOOLEAN
  },
  isFavorite: {
    type: RDBType.BOOLEAN
  },
  lastUploaderId: {
    type: RDBType.STRING
  },
  lastVersionTime: {
    type: RDBType.DATE_TIME
  },
  linked: {
    type: Relationship.oneToMany,
    virtual: {
      name: 'ObjectLink',
      where: (objectLinkTable: any) => ({
        _id: objectLinkTable._parentId
      })
    }
  },
  objectlinksCount: {
    type: RDBType.NUMBER
  },
  pinyin: {
    type: RDBType.NUMBER
  },
  previewUrl: {
    type: RDBType.NUMBER
  },
  py: {
    type: RDBType.STRING
  },
  shareStatus: {
    type: RDBType.NUMBER
  },
  source: {
    type: RDBType.STRING
  },
  tagIds: {
    type: RDBType.LITERAL_ARRAY
  },
  thumbnail: {
    type: RDBType.STRING
  },
  thumbnailUrl: {
    type: RDBType.STRING
  },
  updated: {
    type: RDBType.DATE_TIME
  },
  visible: {
    type: RDBType.STRING
  }
}

schemaColl.add({ schema, name: 'File' })
