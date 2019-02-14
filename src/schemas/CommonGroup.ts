import { SchemaDef, RDBType } from '../db'
import { schemaColl } from './schemas'
import { ApplicationId, CommonGroupId, OrganizationId, ProjectId, TesthubId, UserId, TestplanId } from 'teambition-types'

export enum CommonGroupBoundToObjectType {
  Story = 'story',
  Testhub = 'testhub',
}

export type BoundToStoryObject = {
  _projectId: ProjectId
  _appId: ApplicationId
}

export type BoundToTesthubObject = {
  _organizationId: OrganizationId
  _testhubId: TesthubId
}

export type CommonGroupSchema = {
  _id: CommonGroupId
  _appId: string
  _boundToObjectId: ApplicationId | TesthubId
  _creatorId: UserId
  _projectId: ProjectId
  _testplanId: TestplanId
  ancestorIds: CommonGroupId[]
  boundToObject: BoundToStoryObject | BoundToTesthubObject
  boundToObjectType: CommonGroupBoundToObjectType.Story | CommonGroupBoundToObjectType.Testhub
  created: string
  description: string
  isRoot: boolean
  name: string
  pinyin: string
  pos: number
  resourceCount: number
  updated: string
} & ({
  _boundToObjectId: ApplicationId
  boundToObject: BoundToStoryObject
  boundToObjectType: CommonGroupBoundToObjectType.Story
} | {
  _boundToObjectId: TesthubId
  boundToObject: BoundToTesthubObject
  boundToObjectType: CommonGroupBoundToObjectType.Testhub
})

const schema: SchemaDef<CommonGroupSchema> = {
  _id: {
    type: RDBType.STRING,
    primaryKey: true
  },
  _appId: {
    type: RDBType.STRING
  },
  _boundToObjectId: {
    type: RDBType.STRING
  },
  _creatorId: {
    type: RDBType.STRING
  },
  _projectId: {
    type: RDBType.STRING
  },
  _testplanId: {
    type: RDBType.STRING
  },
  ancestorIds: {
    type: RDBType.LITERAL_ARRAY
  },
  boundToObject: {
    type: RDBType.OBJECT
  },
  boundToObjectType: {
    type: RDBType.STRING
  },
  created: {
    type: RDBType.DATE_TIME
  },
  description: {
    type: RDBType.STRING
  },
  isRoot: {
    type: RDBType.BOOLEAN
  },
  name: {
    type: RDBType.STRING
  },
  pinyin: {
    type: RDBType.STRING
  },
  pos: {
    type: RDBType.NUMBER
  },
  resourceCount: {
    type: RDBType.NUMBER
  },
  updated: {
    type: RDBType.DATE_TIME
  },
}

schemaColl.add({ schema, name: 'CommonGroup' })
