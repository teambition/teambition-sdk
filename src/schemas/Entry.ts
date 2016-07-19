'use strict'
import { Schema, ISchema, schemaName } from './schema'
import { visibility } from '../teambition'

export interface EntryData extends ISchema<EntryData> {
  _id: string
  _projectId: string
  _creatorId: string
  _entryCategoryId: string
  type: number
  content: string
  note: string
  amount: number
  status: string
  involveMembers: string[]
  visiable: visibility
  tagIds: string[]
  created: string
  updated: string
  isArchived: boolean
}

@schemaName('Entry')
export default class EntrySchema extends Schema implements EntryData {
  _id: string = undefined
  _projectId: string = undefined
  _creatorId: string = undefined
  _entryCategoryId: string = undefined
  type: number = undefined
  content: string = undefined
  note: string = undefined
  amount: number = undefined
  status: string = undefined
  involveMembers: string[] = undefined
  visiable: visibility = undefined
  tagIds: string[] = undefined
  created: string = undefined
  updated: string = undefined
  isArchived: boolean = undefined
}
