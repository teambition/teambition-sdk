import {
  EntryId,
  EntryCategoryId,
  ProjectId,
  UserId,
  VisibleOption,
  TagId,
  EntryType,
  EntryStatus
} from 'teambition-types'

export interface EntrySchema {
  _id: EntryId
  _projectId: ProjectId
  _creatorId: UserId
  _entryCategoryId: EntryCategoryId
  objectType: 'entry'
  type: EntryType
  content: string
  note: string
  amount: number
  status: EntryStatus
  involveMembers: UserId[]
  visible: VisibleOption
  tagIds: TagId[]
  date: string
  created: string
  updated: string
  isArchived: boolean
}
