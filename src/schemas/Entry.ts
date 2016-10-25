'use strict'
import { Schema, ISchema, schemaName } from './schema'
import { visibility } from '../teambition'
import {
  EntryId,
  EntryCategoryId,
  ProjectId,
  IdOfMember,
  TagId
} from '../teambition'

export interface EntryData extends ISchema {
  _id: EntryId
  _projectId: ProjectId
  _creatorId: IdOfMember
  _entryCategoryId: EntryCategoryId
  type: number
  content: string
  note: string
  amount: number
  status: string
  involveMembers: string[]
  visible: visibility
  tagIds: TagId[]
  created: string
  updated: string
  isArchived: boolean
}

@schemaName('Entry')
export default class EntrySchema extends Schema<EntryData> implements EntryData {
  _id: EntryId = undefined
  _projectId: ProjectId = undefined
  _creatorId: IdOfMember = undefined
  _entryCategoryId: EntryCategoryId = undefined
  type: number = undefined
  content: string = undefined
  note: string = undefined
  amount: number = undefined
  status: string = undefined
  involveMembers: string[] = undefined
  visible: visibility = undefined
  tagIds: TagId[] = undefined
  created: string = undefined
  updated: string = undefined
  isArchived: boolean = undefined
}
