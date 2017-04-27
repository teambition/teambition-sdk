import {
  TasklistId,
  PreferenceId,
  UserId,
  ProjectId
} from 'teambition-types'
import { RDBType, SchemaDef } from 'reactivedb/interface'
import { schemas } from '../SDK'

export interface PreferenceSchema {
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

const Schema: SchemaDef<PreferenceSchema> = {
  _id: {
    type: RDBType.STRING,
    primaryKey: true
  },
  _userId: {
    type: RDBType.STRING
  },
  hasNew: {
    type: RDBType.BOOLEAN
  },
  isUsePanel: {
    type: RDBType.BOOLEAN
  },
  language: {
    type: RDBType.STRING
  },
  memberBarMode: {
    type: RDBType.STRING
  },
  notification: {
    type: RDBType.OBJECT
  },
  openWindowMode: {
    type: RDBType.STRING
  },
  postMode: {
    type: RDBType.STRING
  },
  quickCreateTask: {
    type: RDBType.STRING
  },
  quickReply: {
    type: RDBType.STRING
  },
  showProjects: {
    type: RDBType.LITERAL_ARRAY
  },
  starProjects: {
    type: RDBType.LITERAL_ARRAY
  },
  switcherOn: {
    type: RDBType.BOOLEAN
  },
  tasklist: {
    type: RDBType.LITERAL_ARRAY
  },
  tips: {
    type: RDBType.OBJECT
  }
}

schemas.push({ name: 'Preference', schema: Schema })
