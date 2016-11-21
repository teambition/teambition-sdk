'use strict'
import { Schema, schemaName, ISchema } from './schema'
import { visibility, EventId, UserId, ProjectId, TagId } from '../teambition'

export interface EventData extends ISchema {
  _id: EventId
  _creatorId: UserId
  title: string
  content: string
  location: string
  startDate: string
  endDate: string
  untilDate: string
  involveMembers: UserId[]
  _projectId: ProjectId
  _sourceId: EventId
  sourceDate: string
  source?: string
  // implements in Event Generator Class
  recurrence?: string[]
  reminders: string[]
  isArchived: boolean
  visible: visibility
  isDeleted?: boolean
  created: string
  updated: string
  tagIds: TagId[]
  status?: string
  isFavorite?: boolean
  objectlinksCount?: number
  mockId?: string
  likesCount?: number
  project?: {
    _id: ProjectId
    name: string
  }
}

@schemaName('Event')
export default class Event extends Schema<EventData> implements EventData {
  _id: EventId = undefined
  endDate: string = undefined
  startDate: string = undefined
  _projectId: ProjectId = undefined
  location: string = undefined
  content: string = undefined
  title: string = undefined
  _creatorId: UserId = undefined
  tagIds: TagId[] = undefined
  updated: string = undefined
  created: string = undefined
  visible: visibility = undefined
  isArchived: boolean = undefined
  involveMembers: UserId[] = undefined
  untilDate: string = undefined
  _sourceId: EventId = undefined
  sourceDate: string = undefined
  reminders: string[] = undefined
}
