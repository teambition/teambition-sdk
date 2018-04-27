'use strict'
import { Schema, schemaName, ISchema } from './schema'
import { ScenarioFieldConfigId, ScenarioFieldConfigIcon, UserId, ProjectId, ScenarioField, ScenarioFieldConfigObjectType } from '../teambition'

export interface ScenarioFieldConfigData extends ISchema {
  _creatorId: UserId
  _id: ScenarioFieldConfigId
  _projectId: ProjectId
  created: string
  displayed: boolean
  icon: ScenarioFieldConfigIcon
  isDefault: boolean
  name: string
  objectType: ScenarioFieldConfigObjectType
  scenariofields: ScenarioField[]
  updated: string
}

@schemaName('ScenarioFieldConfig')
export default class ScenarioFieldConfigSchema extends Schema<ScenarioFieldConfigData> implements ScenarioFieldConfigData {
  _creatorId: UserId = undefined
  _id: ScenarioFieldConfigId = undefined
  _projectId: ProjectId = undefined
  created: string = undefined
  displayed: boolean = undefined
  icon: ScenarioFieldConfigIcon = undefined
  isDefault: boolean = undefined
  name: string = undefined
  objectType: ScenarioFieldConfigObjectType = undefined
  scenariofields: ScenarioField[] = undefined
  updated: string = undefined
}
