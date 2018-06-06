import { DashboardCardId, UserId } from 'teambition-types'

export enum OfficialKey {
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

export enum CardCategory {
  Custom = 'custom',
  Official = 'official'
}

export enum DataSource {
  Tql = 'tql',
  Api = 'api'
}

export enum CardType {
  ListPlain = 'list.plain',
  ListPage = 'list.page',
  ListModal = 'list.modal'
}

export interface DashboardCardSchema {
  _id: DashboardCardId
  category: CardCategory
  created: string
  dataSource: DataSource
  dataUrl: string
  description: string
  isDeleted: boolean
  name: string
  officialKey?: OfficialKey
  pos: number
  updated: string
  viewType: CardType
  _userId: UserId // todo: 可能改名为 _creatorId
}
