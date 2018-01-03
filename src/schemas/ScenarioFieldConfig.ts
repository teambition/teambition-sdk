import { SchemaDef, RDBType } from 'reactivedb/interface'
import { schemaColl } from './schemas'
import {
  EventScenarioFieldIcon,
  ProjectId,
  ScenarioFieldConfigIcon,
  ScenarioFieldConfigId,
  ScenarioFieldConfigObjectType,
  ScenarioProTemplateConfigType,
  TaskScenarioFieldIcon,
  UserId,
} from 'teambition-types'
import {
  ScenarioFieldSchema,
  EventScenarioFieldSchema,
  TaskScenarioFieldSchema,
} from './ScenarioField'

export interface ScenarioFieldConfigSchema {
  _creatorId: UserId
  _id: ScenarioFieldConfigId
  _projectId: ProjectId
  created: string
  displayed: boolean
  icon: ScenarioFieldConfigIcon
  isDefault: boolean
  name: string
  objectType: ScenarioFieldConfigObjectType
  scenariofields: ScenarioFieldSchema[]
  updated: string
  proTemplateConfigType?: ScenarioProTemplateConfigType
}

export interface TaskScenarioFieldConfigSchema extends ScenarioFieldConfigSchema {
  icon: TaskScenarioFieldIcon
  objectType: 'task'
  scenariofields: TaskScenarioFieldSchema[]
}

export interface EventScenarioFieldConfigSchema extends ScenarioFieldConfigSchema {
  icon: EventScenarioFieldIcon
  objectType: 'event'
  scenariofields: EventScenarioFieldSchema[]
}

const schema: SchemaDef<ScenarioFieldConfigSchema> = {
  _id: {
    type: RDBType.STRING,
    primaryKey: true
  },
  _creatorId: {
    type: RDBType.STRING
  },
  _projectId: {
    type: RDBType.STRING
  },
  created: {
    type: RDBType.DATE_TIME
  },
  displayed: {
    type: RDBType.BOOLEAN,
  },
  icon: {
    type: RDBType.STRING
  },
  isDefault: {
    type: RDBType.BOOLEAN
  },
  name: {
    type: RDBType.STRING
  },
  objectType: {
    type: RDBType.STRING
  },
  proTemplateConfigType: {
    type: RDBType.STRING
  },
  scenariofields: {
    type: RDBType.OBJECT
  },
  updated: {
    type: RDBType.DATE_TIME
  }
}

schemaColl.add({ schema, name: 'ScenarioFieldConfig' })
