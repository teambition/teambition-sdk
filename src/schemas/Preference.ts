'use strict'
import { Schema, schemaName, ISchema } from './schema'
import {
  TasklistId,
  PreferenceId,
  UserId,
  ProjectId
} from '../teambition'

export interface PreferenceData extends ISchema {
  _id: PreferenceId
  _userId: UserId
  language: string
  showProjects?: ProjectId[]
  starProjects?: {
    [index: string]: ProjectId
  }
  tasklist?: {
    [index: string]: TasklistId[]
  }
  tips: any
  notification: any
  openWindowMode: string
  postMode: 'html' | 'markdown'
  quickCreateTask: boolean
  quickReply: boolean
  hasNew: boolean
  switcherOn: boolean
  memberBarMode: string
  isUsePanel: boolean
}

@schemaName('Preference')
export default class Preference extends Schema<PreferenceData> implements PreferenceData {
  _id: PreferenceId = undefined
  _userId: UserId = undefined
  language: string = undefined
  tips: any = undefined
  notification: any = undefined
  openWindowMode: string = undefined
  postMode: 'html' | 'markdown' = undefined
  quickCreateTask: boolean = undefined
  quickReply: boolean = undefined
  hasNew: boolean = undefined
  switcherOn: boolean = undefined
  memberBarMode: string = undefined
  isUsePanel: boolean = undefined
}
