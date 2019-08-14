import {
  TasklistId,
  PreferenceId,
  UserId,
  ProjectId,
  ProjectOrder,
  OrganizationId,
  ProjectPortalMode
} from 'teambition-types'
import { RDBType, SchemaDef } from '../db'
import { schemaColl } from './schemas'

export interface PreferenceTipMap {
  [key: string]: boolean | string
}

export interface PreferenceSchema {
  _id: PreferenceId
  _userId: UserId
  language: string                        // @isayme: 优先使用 `UserMe.language`
  showProjects?: ProjectId[]
  collectBehaviorLogs: boolean
  organization: { isShowChildTeams: boolean }
  tasklist?: Record<string, TasklistId[]> // 键类型为 ProjectId
  tips: PreferenceTipMap
  selections: Record<string, string[]>    // 键类型为 ProjectId
  notifications: Record<string, boolean>
  notification: Record<string, Partial<Record<'email' | 'mobile', boolean>>>
  emails: Record<string, boolean>
  lastNoticeDate?: string
  lastWorkspace: OrganizationId
  myTaskExecuteSort: string
  myTaskInvolvesSort: string
  myTaskCreatedSort: string
  myFileOrder: string
  libraryOrder: string
  messageType: string
  portalMode: ProjectPortalMode
  projectOrder: ProjectOrder
  inboxSortMode: string
  openWindowMode: string
  activityMode: 'text' | 'markdown'
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
  activityMode: {
    type: RDBType.STRING
  },
  collectBehaviorLogs: {
    type: RDBType.BOOLEAN
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
  language: {
    type: RDBType.STRING
  },
  lastNoticeDate: {
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
  messageType: {
    type: RDBType.STRING
  },
  myFileOrder: {
    type: RDBType.STRING
  },
  myTaskCreatedSort: {
    type: RDBType.STRING
  },
  myTaskExecuteSort: {
    type: RDBType.STRING
  },
  myTaskInvolvesSort: {
    type: RDBType.STRING
  },
  notification: {
    type: RDBType.OBJECT
  },
  notifications: {
    type: RDBType.OBJECT
  },
  openWindowMode: {
    type: RDBType.STRING
  },
  organization: {
    type: RDBType.OBJECT
  },
  portalMode: {
    type: RDBType.STRING
  },
  projectOrder: {
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
  selections: {
    type: RDBType.OBJECT
  },
  showProjects: {
    type: RDBType.LITERAL_ARRAY
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

schemaColl.add({ name: 'Preference', schema: Schema })
