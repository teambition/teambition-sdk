import { SchemaDef, RDBType } from 'reactivedb/interface'
import { schemaColl } from './schemas'
import { OrganizationId, ProjectId, ProjectTagId, UserId } from 'teambition-types'

export interface ProjectTagSchema {
  _id: ProjectTagId
  _organizationId: OrganizationId
  name: string
  pos: number
  projectIds: ProjectId[] // 该分组下的项目的 ids
  childProjectIds: ProjectId[] // 该分组子分组（递归）下的项目的 ids
  _creatorId?: UserId
  isDeleted: boolean
  isStar: boolean
  hasChild: boolean
  projectCount: number
  ancestorIds: ProjectTagId[]
  style: string
  created: string
  updated: string
  visibility?: string
  masters?: UserId[]
  startDate?: string
  dueDate?: string
  description?: string
  permissionBinding?: {
    level: number
    permissions: string[]
  }
}

const schema: SchemaDef<ProjectTagSchema> = {
  _id: {
    type: RDBType.STRING,
    primaryKey: true
  },
  _organizationId: {
    type: RDBType.STRING
  },
  _creatorId: {
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
  description: {
    type: RDBType.STRING
  },
  dueDate: {
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
  masters: {
    type: RDBType.OBJECT
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
  startDate: {
    type: RDBType.DATE_TIME
  },
  style: {
    type: RDBType.STRING
  },
  updated: {
    type: RDBType.DATE_TIME
  },
  visibility: {
    type: RDBType.STRING
  }
}

schemaColl.add({ schema, name: 'ProjectTag' })
