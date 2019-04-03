import { SchemaDef, RDBType } from '../db'
import { schemaColl } from './schemas'
import { OrganizationId, ProjectId, ProjectTagId, UserId, PermissionBinding, ProjectTagVisibleOption } from 'teambition-types'

export interface ProjectTagSchema {
  _creatorId?: UserId
  _id: ProjectTagId
  _organizationId: OrganizationId
  ancestorIds: ProjectTagId[]
  childProjectIds: ProjectId[] // 该分组子分组（递归）下的项目的 ids
  created: string
  hasChild: boolean
  isDeleted: boolean
  isStar: boolean
  name: string
  permissionBinding?: PermissionBinding
  pos: number
  projectCount: number
  projectIds: ProjectId[] // 该分组下的项目的 ids
  strictVisible: boolean
  style: string
  updated: string
  visible: ProjectTagVisibleOption
}

const schema: SchemaDef<ProjectTagSchema> = {
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
  ancestorIds: {
    type: RDBType.LITERAL_ARRAY
  },
  childProjectIds: {
    type: RDBType.LITERAL_ARRAY
  },
  created: {
    type: RDBType.DATE_TIME
  },
  hasChild: {
    type: RDBType.BOOLEAN
  },
  isDeleted: {
    type: RDBType.BOOLEAN
  },
  isStar: {
    type: RDBType.BOOLEAN
  },
  name: {
    type: RDBType.STRING
  },
  permissionBinding: {
    type: RDBType.OBJECT
  },
  pos: {
    type: RDBType.NUMBER
  },
  projectCount: {
    type: RDBType.NUMBER
  },
  projectIds: {
    type: RDBType.LITERAL_ARRAY
  },
  strictVisible: {
    type: RDBType.BOOLEAN
  },
  style: {
    type: RDBType.STRING
  },
  updated: {
    type: RDBType.DATE_TIME
  },
  visible: {
    type: RDBType.STRING
  }
}

schemaColl.add({ schema, name: 'ProjectTag' })
