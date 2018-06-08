import { DashboardCardId, UserId } from 'teambition-types'

export enum DashboardOfficialKey {
  Recent = 'recent',
  TaskExecuted = 'task_executed',
  TaskInvolved = 'task_involved',
  TaskCreated = 'task_created',
  Favorite = 'favorite',
  WorkCreated = 'work_created',
  EventInvolved = 'event_involved',
  History = 'history',
  Apps = 'apps'
}

export enum DashboardCardCategory {
  Custom = 'custom',
  Official = 'official'
}

export enum DashboardDataSource {
  Tql = 'tql',
  Api = 'api'
}

export enum DashboardCardType {
  ListPlain = 'list.plain',
  ListPage = 'list.page',
  ListModal = 'list.modal'
}

export interface DashboardCardSchema {
  _id: DashboardCardId
  category: DashboardCardCategory
  created: string
  dataSource: DashboardDataSource
  dataUrl: string
  description: string
  isDeleted: boolean
  name: string
  officialKey?: DashboardOfficialKey
  pos: number
  updated: string
  viewType: DashboardCardType
  _userId: UserId // todo: 可能改名为 _creatorId
}
