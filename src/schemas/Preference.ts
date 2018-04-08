import {
  TasklistId,
  PreferenceId,
  UserId,
  ProjectId,
  OrganizationId,
  StageId
} from 'teambition-types'
import { RDBType, SchemaDef } from 'reactivedb/interface'
import { schemaColl } from './schemas'

export interface PreferenceTipMap {
  [key: string]: boolean | PreferenceTipMap
}

export interface PreferenceSchema {
  _id: PreferenceId
  _userId: UserId
  language: string
  taskSort?: Record<string, StageId[]>
  showProjects?: ProjectId[]
  starProjects?: Record<string, ProjectId>
  organization: { isShowChildTeams: boolean }
  tasklist?: Record<string, TasklistId[]>
  tips: PreferenceTipMap
  selections: Record<string, string[]>
  notifications: Record<string, boolean>
  notification: Record<string, Partial<Record<'email' | 'mobile', boolean>>>
  emails: Record<string, boolean>
  lastNoticeDate?: string
  lastWorkspace: 'personal' | OrganizationId
  myTaskExecuteSort: string
  myTaskInvolvesSort: string
  myTaskCreatedSort: string
  myFileOrder: string
  libraryOrder: string
  messageType: string
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
  language: {
    type: RDBType.STRING
  },
  taskSort: {
    type: RDBType.OBJECT
  },
  showProjects: {
    type: RDBType.LITERAL_ARRAY
  },
  starProjects: {
    type: RDBType.OBJECT
  },
  organization: {
    type: RDBType.OBJECT
  },
  tasklist: {
    type: RDBType.OBJECT
  },
  tips: {
    type: RDBType.OBJECT
  },
  selections: {
    type: RDBType.OBJECT
  },
  notifications: {
    type: RDBType.OBJECT
  },
  notification: {
    type: RDBType.OBJECT
  },
  emails: {
    type: RDBType.OBJECT
  },
  lastNoticeDate: {
    type: RDBType.STRING
  },
  lastWorkspace: {
    type: RDBType.STRING
  },
  myTaskExecuteSort: {
    type: RDBType.STRING
  },
  myTaskInvolvesSort: {
    type: RDBType.STRING
  },
  myTaskCreatedSort: {
    type: RDBType.STRING
  },
  myFileOrder: {
    type: RDBType.STRING
  },
  libraryOrder: {
    type: RDBType.STRING
  },
  messageType: {
    type: RDBType.STRING
  },
  portalMode: {
    type: RDBType.STRING
  },
  inboxSortMode: {
    type: RDBType.STRING
  },
  openWindowMode: {
    type: RDBType.STRING
  },
  postMode: {
    type: RDBType.STRING
  },
  quickCreateTask: {
    type: RDBType.BOOLEAN
  },
  quickReply: {
    type: RDBType.BOOLEAN
  },
  hasNew: {
    type: RDBType.BOOLEAN
  },
  switcherOn: {
    type: RDBType.BOOLEAN
  },
  memberBarMode: {
    type: RDBType.STRING
  },
  isUsePanel: {
    type: RDBType.BOOLEAN
  }
}

schemaColl.add({ name: 'Preference', schema: Schema })
