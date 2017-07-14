import { SchemaDef, Relationship, RDBType } from 'reactivedb/interface'
import { schemas } from '../SDK'
import {
  RoomId,
  UserId,
  ProjectId,
  GroupId
} from 'teambition-types'

export interface RoomSchema {
  _id: RoomId
  _userIds: [UserId]
  _projectId?: ProjectId
  userChannel?: string
  _boundToObjectId: string
  boundToObjectType?: 'project' | 'group'
  created: string
  updated: string
  noReply: boolean
  users?: [object]
  isMute?: boolean
  project?: {
    isPublic: boolean
    logo: string
    modelType: string
    name: string
    pinyin: string
    py: string
    _id: ProjectId
  }
  group?: {
    logo: string
    modelType: string
    name: string
    pinyin: string
    py: string
    _id: GroupId
  }
}

const schema: SchemaDef<RoomSchema> = {
  _id: {
    type: RDBType.STRING,
    primaryKey: true
  },
  _userIds: {
    type: RDBType.LITERAL_ARRAY
  },
  _projectId: {
    type: RDBType.STRING
  },
  userChannel: {
    type: RDBType.STRING
  },
  _boundToObjectId: {
    type: RDBType.STRING
  },
  boundToObjectType: {
    type: RDBType.STRING
  },
  created: {
    type: RDBType.DATE_TIME
  },
  updated: {
    type: RDBType.DATE_TIME
  },
  noReply: {
    type: RDBType.BOOLEAN
  },
  users: {
    type: RDBType.LITERAL_ARRAY
  },
  isMute: {
    type: RDBType.BOOLEAN
  },
  project: {
    type: Relationship.oneToOne,
    virtual: {
      name: 'Project',
      where: (projectTable: any) => ({
        _boundToObjectId: projectTable._id
      })
    }
  },
  group: {
    type: Relationship.oneToOne,
    virtual: {
      name: 'Group',
      where: (groupTable: any) => ({
        _boundToObjectId: groupTable._id
      })
    }
  }
}

schemas.push({ schema, name: 'Room' })
