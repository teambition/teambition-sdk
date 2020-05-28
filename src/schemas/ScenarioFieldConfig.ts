import { SchemaDef, RDBType, Relationship } from '../db'
import { schemaColl } from './schemas'
import {
  EventScenarioFieldIcon,
  ProjectId,
  ScenarioFieldConfigIcon,
  ScenarioFieldConfigId,
  ScenarioFieldConfigObjectType,
  ScenarioProTemplateConfigType,
  TestcaseScenarioFieldIcon,
  TaskflowId,
  TaskScenarioFieldIcon,
  UserId,
  OrganizationId,
  ApplicationId,
} from 'teambition-types'
import {
  ScenarioFieldSchema,
  EventScenarioFieldSchema,
  TaskScenarioFieldSchema,
  TestcaseScenarioFieldSchema,
  ApplicationScenarioFieldSchema,
} from './ScenarioField'
import { TaskflowStatusSnippet } from './TaskflowStatus'

export interface ScenarioFieldConfigSchema {
  _boundToObjectId: OrganizationId | ProjectId | ApplicationId | null
  _creatorId: UserId
  _id: ScenarioFieldConfigId
  _originalId: ScenarioFieldConfigId | null
  _projectId: ProjectId
  basicfields: ScenarioFieldSchema[]
  boundToObjectType: 'organization' | 'project' | 'app'
  created: string
  displayed: boolean
  hasChanged: boolean
  icon: ScenarioFieldConfigIcon
  isDefault: boolean
  isTraceEnabled: boolean
  name: string
  objectType: ScenarioFieldConfigObjectType
  scenariofields: ScenarioFieldSchema[]
  type: 'default' | 'official' | 'normal'
  proTemplateConfigType?: string | null
  setting?: {
    removable?: boolean
    taskflowChangeable?: boolean
  }
  updated: string
}

export interface TaskScenarioFieldConfigSchema extends ScenarioFieldConfigSchema {
  icon: TaskScenarioFieldIcon
  objectType: 'task'
  scenariofields: TaskScenarioFieldSchema[]

  // pro fields
  proTemplateConfigType: ScenarioProTemplateConfigType
  _taskflowId: TaskflowId
  taskflowstatuses?: TaskflowStatusSnippet[]
}

export interface EventScenarioFieldConfigSchema extends ScenarioFieldConfigSchema {
  icon: EventScenarioFieldIcon
  objectType: 'event'
  scenariofields: EventScenarioFieldSchema[]
  _taskflowId: null
  proTemplateConfigType: null
}

export interface TestcaseScenarioFieldConfigSchema extends ScenarioFieldConfigSchema {
  icon: TestcaseScenarioFieldIcon
  objectType: 'testcase'
  scenariofields: TestcaseScenarioFieldSchema[]

  proTemplateConfigType: null
  _taskflowId: TaskflowId
  taskflowstatuses?: TaskflowStatusSnippet[]
}

export interface ApplicationScenarioFieldConfigSchema extends ScenarioFieldConfigSchema {
  scenariofields: ApplicationScenarioFieldSchema[]
}

const schema: SchemaDef<
  | TaskScenarioFieldConfigSchema
  | EventScenarioFieldConfigSchema
  | TestcaseScenarioFieldConfigSchema
  | ApplicationScenarioFieldConfigSchema
> = {
  _boundToObjectId: {
    type: RDBType.STRING
  },
  _creatorId: {
    type: RDBType.STRING
  },
  _id: {
    type: RDBType.STRING,
    primaryKey: true
  },
  _originalId: {
    type: RDBType.STRING
  },
  _projectId: {
    type: RDBType.STRING
  },
  _taskflowId: {
    type: RDBType.STRING
  },
  basicfields: {
    type: RDBType.OBJECT
  },
  boundToObjectType: {
    type: RDBType.STRING
  },
  created: {
    type: RDBType.DATE_TIME
  },
  displayed: {
    type: RDBType.BOOLEAN
  },
  hasChanged: {
    type: RDBType.BOOLEAN
  },
  icon: {
    type: RDBType.STRING
  },
  isDefault: {
    type: RDBType.BOOLEAN
  },
  isTraceEnabled: {
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
  setting: {
    type: RDBType.OBJECT
  },
  taskflowstatuses: {
    type: Relationship.oneToMany,
    virtual: {
      name: 'TaskflowStatus',
      where: (taskflowStatusTable: any) => ({
        _taskflowId: taskflowStatusTable._taskflowId
      })
    }
  },
  type: {
    type: RDBType.STRING
  },
  updated: {
    type: RDBType.DATE_TIME
  }
}

schemaColl.add({ schema, name: 'ScenarioFieldConfig' })
