import { OrganizationId, ProjectId, ProjectTagId, UserId } from 'teambition-types'

export interface ProjectTagSchema {
  _id: ProjectTagId
  _organizationId: OrganizationId
  name: string
  pos: number
  projectIds: ProjectId[] // 该分组下的项目的 ids
  childProjectIds: ProjectId[] // 该分组子分组（递归）下的项目的 ids
  _creatorId: UserId
  isDeleted: boolean
  ancestorIds: ProjectTagId[]
  style: string
  color: string
  created: string
  updated: string
}
