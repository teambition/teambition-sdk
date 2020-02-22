import {
  UserId, ProjectId, UserSnippet, SmartGroupId, CustomApplicationId
} from 'teambition-types'

import { SchemaDef, RDBType } from '../db'
import { schemaColl } from './schemas'

interface LangData {
  zh: string
  en: string
}

export enum CustomApplicationType {
  TASK = 100
}

export interface CustomApplicationSchema {
  _creatorId: UserId
  _id: CustomApplicationId
  _projectId: ProjectId
  created: string
  creator: UserSnippet
  description: LangData
  isDeleted: boolean
  isEnabled: boolean
  modifier: UserSnippet | null
  payload: {
    _smartgroupId: SmartGroupId
  }
  title: LangData
  type: CustomApplicationType
  updated: string
}

const schema: SchemaDef<CustomApplicationSchema> = {
  _creatorId: {
    type: RDBType.STRING
  },
  _id: {
    type: RDBType.STRING,
    primaryKey: true
  },
  _projectId: {
    type: RDBType.STRING
  },
  created: {
    type: RDBType.STRING
  },
  creator: {
    type: RDBType.OBJECT,
  },
  description: {
    type: RDBType.OBJECT
  },
  isDeleted: {
    type: RDBType.BOOLEAN
  },
  isEnabled: {
    type: RDBType.BOOLEAN
  },
  modifier: {
    type: RDBType.OBJECT,
  },
  payload: {
    type: RDBType.OBJECT
  },
  title: {
    type: RDBType.OBJECT
  },
  type: {
    type: RDBType.NUMBER
  },
  updated: {
    type: RDBType.STRING
  },
}

schemaColl.add({ schema, name: 'CustomApplication' })
