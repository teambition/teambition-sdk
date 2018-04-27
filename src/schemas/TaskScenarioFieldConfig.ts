'use strict'
import { schemaName } from './schema'
import { TaskScenarioFieldIcon, TaskScenarioField, TaskflowId, ScenarioProTemplateConfigType } from '../teambition'
import ScenarioFieldConfigSchema, { ScenarioFieldConfigData } from './ScenarioFieldConfig'
import { TaskflowStatusData } from './TaskflowStatus'

export interface TaskScenarioFieldConfigData extends ScenarioFieldConfigData {
  _taskflowId: TaskflowId | null
  icon: TaskScenarioFieldIcon
  objectType: 'task'
  proTemplateConfigType: ScenarioProTemplateConfigType
  scenariofields: TaskScenarioField[]
  taskflowstatuses?: Pick<TaskflowStatusData, '_id' | '_taskflowId' | 'kind' | 'name' | 'pos' | 'rejectStatusIds'>[]
}

@schemaName('TaskScenarioFieldConfig')
export default class TaskScenarioFieldConfigSchema extends ScenarioFieldConfigSchema implements TaskScenarioFieldConfigData {
  _taskflowId: TaskflowId | null = undefined
  icon: TaskScenarioFieldIcon = undefined
  objectType: 'task' = undefined
  proTemplateConfigType: ScenarioProTemplateConfigType = undefined
  scenariofields: TaskScenarioField[] = undefined
  taskflowstatuses?: TaskScenarioFieldConfigData['taskflowstatuses']
}
