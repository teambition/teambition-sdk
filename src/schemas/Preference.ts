'use strict'
import { Schema, schemaName, ISchema } from './schema'

export interface PreferenceData extends ISchema<PreferenceData> {
  _id: string
  _userId: string
  language: string
  showProjects?: string[]
  starProjects?: {
    [index: string]: string
  }
  taskSort: {
    [index: string]: string[]
  }
  tasklist: {
    [index: string]: string[]
  }
  tips: any
  notification: any
  openWindowMode: string
  postMode: string
  quickCreateTask: boolean
  quickReply: boolean
  hasNew: boolean
  switcherOn: boolean
  memberBarMode: string
  isUsePanel: boolean
}

@schemaName('Preference')
export default class Preference extends Schema implements PreferenceData {
  _id: string = undefined
  _userId: string = undefined
  language: string = undefined
  taskSort: {
    [index: string]: string[]
  } = undefined
  tasklist: {
    [index: string]: string[]
  } = undefined
  tips: any = undefined
  notification: any = undefined
  openWindowMode: string = undefined
  postMode: string = undefined
  quickCreateTask: boolean = undefined
  quickReply: boolean = undefined
  hasNew: boolean = undefined
  switcherOn: boolean = undefined
  memberBarMode: string = undefined
  isUsePanel: boolean = undefined
}
