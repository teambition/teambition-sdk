import {
  EntryId,
  EntryCategoryId,
  ProjectId,
  UserId,
  Visibility,
  TagId
} from 'teambition-types'

export interface EntryData {
  _id: EntryId
  _projectId: ProjectId
  _creatorId: UserId
  _entryCategoryId: EntryCategoryId
  type: number
  content: string
  note: string
  amount: number
  status: string
  involveMembers: string[]
  visible: Visibility
  tagIds: TagId[]
  created: string
  updated: string
  isArchived: boolean
}
