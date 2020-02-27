import { SchemaDef, RDBType } from '../db'
import { MemberIdentityId, ProjectId, OrganizationId } from 'teambition-types'
import { schemaColl } from './schemas'

export interface MemberIdentitySchema {
  _id: MemberIdentityId
  name: string
  created: string
  _boundToObjectId: ProjectId | OrganizationId
  boundToObjectType: 'project' | 'organization'
}

export interface ProjectMemberIdentitySchema extends MemberIdentitySchema {
  _boundToObjectId: ProjectId
  boundToObjectType: 'project'
}

const schema: SchemaDef<MemberIdentitySchema> = {
  _id: {
    type: RDBType.STRING,
    primaryKey: true,
  },
  _boundToObjectId: {
    type: RDBType.STRING,
  },
  boundToObjectType: {
    type: RDBType.STRING,
  },
  name: {
    type: RDBType.STRING,
  },
  created: {
    type: RDBType.STRING,
  }
}

schemaColl.add({ schema, name: 'MemberIdentity' })
