import { TagId, UserId, ProjectId, DefaultColors } from 'teambition-types'

export interface TagSchema {
  _creatorId: UserId
  _id: TagId
  _projectId: ProjectId
  color: DefaultColors
  created: string
  isArchived: boolean
  name: string
  updated: string
  postsCount?: number
  tasksCount?: number
  eventsCount?: number
  worksCount?: number
}
