import { UserId, ProjectId, EntryCategoryId, EntryType } from 'teambition-types'

export interface EntryCategorySchema {
  _id: EntryCategoryId
  _projectId: ProjectId
  _creatorId: UserId
  title: string
  type: EntryType
  icon: string
  isDefault: boolean
  created: string
  updated?: string
  entriesCount?: number
}
