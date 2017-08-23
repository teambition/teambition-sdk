import { OrganizationId, ProjectTagId } from 'teambition-types'

export interface ProjectTagSchema {
  _id: ProjectTagId
  _organizationId: OrganizationId
  name: string
  pos: number
}
