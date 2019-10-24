import { ProjectTemplateId, UserId, OrganizationId, ExecutorOrCreator, ProjectTemplateVisibleOption } from 'teambition-types'

export interface ProjectTemplateSchema {
  _creatorId: UserId
  _id: ProjectTemplateId
  _organizationId?: OrganizationId | null
  banners: string[]
  categories: string[]
  created: string
  creator?: ExecutorOrCreator
  description: string
  isDeleted: boolean
  isDemo: boolean
  isDraft: boolean
  isExtendedTemplate?: boolean
  isPro?: boolean
  lang?: string
  logo: string
  name: string
  permissionBinding?: {
    permissions: string[]
  }
  subtype?: string
  updated: string
  visible: ProjectTemplateVisibleOption
}
