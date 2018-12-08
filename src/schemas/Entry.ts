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
  _creatorId: UserId
  _entryCategoryId: EntryCategoryId
  _id: EntryId
  _projectId: ProjectId
  amount: number
  content: string
  created: string
  date: string
  involveMembers: UserId[]
  isArchived: boolean
  note: string
  objectType: 'entry'
  status: EntryStatus
  tagIds: TagId[]
  type: EntryType
  updated: string
  visible: VisibleOption
}
