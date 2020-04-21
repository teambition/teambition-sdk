import {
  KanbanConfigId, ScenarioFieldConfigId, ProjectId
} from 'teambition-types'

import { RDBType, SchemaDef } from '../db'
import { schemaColl } from './schemas'

export enum KanbanConfigDisplayedField {
  updated = 'updated',
  creator = 'creator',
  created = 'created',
  accomplished = 'accomplished',
  effort = 'effort',
}

export interface KanbanConfigSchema {
  _id: KanbanConfigId
  _projectId: ProjectId
  _scenariofieldconfigId: ScenarioFieldConfigId
  created: string
  displayedFields: ReadonlyArray<KanbanConfigDisplayedField>
  updated: string
}

const schema: SchemaDef<KanbanConfigSchema> = {
  _id: {
    type: RDBType.STRING,
    primaryKey: true,
  },
  _projectId: {
    type: RDBType.STRING,
  },
  _scenariofieldconfigId: {
    type: RDBType.STRING,
  },
  created: {
    type: RDBType.DATE_TIME,
  },
  displayedFields: {
    type: RDBType.OBJECT
  },
  updated: {
    type: RDBType.DATE_TIME,
  },
}

schemaColl.add({ name: 'KanbanConfig', schema })
