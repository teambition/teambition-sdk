import { UserId, ProjectId, EntryCategoryId } from 'teambition-types'

export interface EntrycategoryData {
  _id: EntryCategoryId
  _projectId: ProjectId
  _creatorId: UserId
  title: string
  type: number
  icon: string
  isDefault: boolean
  created: string
  updated?: string
  entriesCount?: number
}
