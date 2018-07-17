import { ProjectTemplateId, UserId, OrganizationId, ExecutorOrCreator } from 'teambition-types'

export interface ProjectTemplateSchema {
  _id: ProjectTemplateId
  _organizationId?: OrganizationId | null

  _creatorId: UserId
  creator?: ExecutorOrCreator

  name: string
  logo: string
  lang?: string
  description: string

  banners: string[]
  categories: string[]
  subtype?: string[]

  isDemo: boolean
  isDeleted: boolean

  created: string
  updated: string
}
