'use strict'
import {Schema} from './schema'

export default class Event extends Schema {
  _id: string = undefined
  endDate: string = undefined
  startDate: string = undefined
  _projectId: string = undefined
  location: string = undefined
  content: string = undefined
  title: string = undefined
  _creatorId: string = undefined
  tagIds: string[] = undefined
  updated: string = undefined
  created: string = undefined
  visiable: string = undefined
  visible: string = undefined
  isArchived: boolean = undefined
  involveMembers: string [] = undefined
  status: string = undefined
  untilDate: string = undefined
  _sourceId: string = undefined
  sourceDate: string = undefined
  recurrence: string[] = undefined
  reminders: string[] = undefined
  isFavorite: boolean = undefined
  objectlinksCount: number = undefined
}
