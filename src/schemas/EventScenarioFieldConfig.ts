'use strict'
import { schemaName } from './schema'
import { EventScenarioFieldIcon, EventScenarioField } from '../teambition'
import ScenarioFieldConfigSchema, { ScenarioFieldConfigData } from './ScenarioFieldConfig'

export interface EventScenarioFieldConfigData extends ScenarioFieldConfigData {
  _taskflowId: null
  icon: EventScenarioFieldIcon
  objectType: 'event'
  proTemplateConfigType: null
  scenariofields: EventScenarioField[]
}

@schemaName('EventScenarioFieldConfig')
export default class EventScenarioFieldConfigSchema extends ScenarioFieldConfigSchema implements EventScenarioFieldConfigData {
  _taskflowId: null
  icon: EventScenarioFieldIcon = undefined
  objectType: 'event' = undefined
  proTemplateConfigType: null
  scenariofields: EventScenarioField[] = undefined
}
