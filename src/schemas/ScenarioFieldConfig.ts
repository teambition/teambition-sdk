import { SchemaDef, RDBType, Relationship } from 'reactivedb/interface'
import { schemaColl } from './schemas'
import {
  EventScenarioFieldIcon,
  ProjectId,
  ScenarioFieldConfigIcon,
  ScenarioFieldConfigId,
  ScenarioFieldConfigObjectType,
  ScenarioProTemplateConfigType,
  TaskflowId,
  TaskScenarioFieldIcon,
  UserId,
  OrganizationId
} from 'teambition-types'
import { ScenarioFieldSchema, EventScenarioFieldSchema, TaskScenarioFieldSchema } from './ScenarioField'
import { TaskflowStatusSnippet } from './TaskflowStatus'

export interface ScenarioFieldConfigSchema {
  _boundToObjectId: OrganizationId | ProjectId | null
  _creatorId: UserId
  _id: ScenarioFieldConfigId
  _originalId: ScenarioFieldConfigId | null
  _projectId: ProjectId
  boundToObjectType: 'organization' | 'project'
  created: string
  displayed: boolean
  hasChanged: boolean
  icon: ScenarioFieldConfigIcon
  isDefault: boolean
  name: string
  objectType: ScenarioFieldConfigObjectType
  scenariofields: ScenarioFieldSchema[]
  type: 'default' | 'official' | 'normal'
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

const schema: SchemaDef<
  TaskScenarioFieldConfigSchema
  | EventScenarioFieldConfigSchema> = {
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
      type: Relationship.oneToMany,
      virtual: {
        name: 'ScenarioField',
        where: ((scenarioField: ScenarioFieldSchema): Partial<ScenarioFieldConfigSchema> => ({
          _id: scenarioField._scenariofieldconfigId
        })) as any
      }
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
