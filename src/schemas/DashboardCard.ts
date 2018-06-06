import { SchemaDef, RDBType } from 'reactivedb/interface'
import { schemaColl } from './schemas'
import {
  DashboardCardId,
  UserId
} from 'teambition-types'

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
  thumbnailUrl?: string
  isDeleted: boolean
  name: string
  officialKey?: OfficialKey
  pos: number
  updated: string
  viewType: CardType
  _userId: UserId
}

const Schema: SchemaDef<DashboardCardSchema> = {
  _id: {
    type: RDBType.STRING,
    primaryKey: true
  },
  category: {
    type: RDBType.STRING
  },
  created: {
    type: RDBType.STRING
  },
  dataSource: {
    type: RDBType.STRING
  },
  dataUrl: {
    type: RDBType.STRING
  },
  description: {
    type: RDBType.STRING
  },
  thumbnailUrl: {
    type: RDBType.STRING
  },
  isDeleted: {
    type: RDBType.BOOLEAN
  },
  name: {
    type: RDBType.STRING
  },
  officialKey: {
    type: RDBType.STRING
  },
  pos: {
    type: RDBType.NUMBER
  },
  updated: {
    type: RDBType.STRING
  },
  viewType: {
    type: RDBType.STRING
  },
  _userId: {
    type: RDBType.STRING
  }
}

schemaColl.add({ schema: Schema, name: 'DashboardCard' })
