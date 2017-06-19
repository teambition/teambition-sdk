import {
  TasklistId,
  PreferenceId,
  UserId,
  OrganizationId
} from 'teambition-types'
import { RDBType, SchemaDef } from 'reactivedb/interface'
import { schemas } from '../SDK'

export interface PreferenceSchema {
  _id: PreferenceId
  _userId: UserId
  tasklist?: {
    [index: string]: TasklistId[]
  }
  tips: any
  lastNoticeDate: string
  lastOrgReportDate: string
  selections: any
  emails: any
  notification: any
  lastWorkspace: OrganizationId | null
  lastOrgId: OrganizationId | null
  myFileOrder: string
  libraryOrder: string
  portalMode: string
  inboxSortMode: string
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
  emails: {
    type: RDBType.OBJECT
  },
  hasNew: {
    type: RDBType.BOOLEAN
  },
  inboxSortMode: {
    type: RDBType.STRING
  },
  isUsePanel: {
    type: RDBType.BOOLEAN
  },
  lastNoticeDate: {
    type: RDBType.DATE_TIME
  },
  lastOrgId: {
    type: RDBType.STRING
  },
  lastOrgReportDate: {
    type: RDBType.DATE_TIME
  },
  lastWorkspace: {
    type: RDBType.STRING
  },
  libraryOrder: {
    type: RDBType.STRING
  },
  memberBarMode: {
    type: RDBType.STRING
  },
  myFileOrder: {
    type: RDBType.STRING
  },
  notification: {
    type: RDBType.OBJECT
  },
  openWindowMode: {
    type: RDBType.STRING
  },
  portalMode: {
    type: RDBType.STRING
  },
  postMode: {
    type: RDBType.STRING
  },
  selections: {
    type: RDBType.OBJECT
  },
  quickCreateTask: {
    type: RDBType.STRING
  },
  quickReply: {
    type: RDBType.STRING
  },
  switcherOn: {
    type: RDBType.BOOLEAN
  },
  tasklist: {
    type: RDBType.OBJECT
  },
  tips: {
    type: RDBType.OBJECT
  }
}

schemas.push({ name: 'Preference', schema: Schema })
