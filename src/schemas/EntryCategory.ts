import { UserId, ProjectId, EntryCategoryId, EntryType } from 'teambition-types'

export interface EntryCategorySchema {
  _creatorId: UserId
  _id: EntryCategoryId
  _projectId: ProjectId
  created: string
  entriesCount?: number
  icon: string
  isDefault: boolean
  title: string
  type: EntryType
  updated?: string
}
