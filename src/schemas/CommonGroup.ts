import { SchemaDef, RDBType } from 'reactivedb/interface'
import { schemaColl } from './schemas'
import { CommonGroupId, ProjectId, UserId } from 'teambition-types'

export interface CommonGroupSchema {
  _id: CommonGroupId
  _appId: string
  _creatorId: UserId
  _projectId: ProjectId
  ancestorIds: CommonGroupId[]
  created: string
  description: string
  name: string
  pos: number
  updated: string
  uniqueId: string
}

const schema: SchemaDef<CommonGroupSchema> = {
  _id: {
    type: RDBType.STRING,
    primaryKey: true
  },
  _appId: {
    type: RDBType.STRING
  },
  _creatorId: {
    type: RDBType.STRING
  },
  _projectId: {
    type: RDBType.STRING
  },
  ancestorIds: {
    type: RDBType.LITERAL_ARRAY
  },
  created: {
    type: RDBType.DATE_TIME
  },
  description: {
    type: RDBType.STRING
  },
  name: {
    type: RDBType.STRING
  },
  pos: {
    type: RDBType.NUMBER
  },
  updated: {
    type: RDBType.DATE_TIME
  },
  uniqueId: {
    type: RDBType.STRING
  },
}

schemaColl.add({ schema, name: 'CommonGroup' })
