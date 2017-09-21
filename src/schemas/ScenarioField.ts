import {
  CustomFieldId,
  CustomScenarioFieldType,
  EventOfficialScenarioFieldType,
  RoleId,
  ScenarioFieldType,
  TaskOfficialScenarioFieldType,
} from 'teambition-types'

export interface ScenarioFieldSchema<T = ScenarioFieldType> {
  fieldType: T
  _roleIds: RoleId[]
  displayed: boolean
  required: boolean
}

export interface CustomScenarioFieldSchema extends ScenarioFieldSchema<CustomScenarioFieldType> {
  _customfieldId: CustomFieldId
}

export type TaskScenarioFieldSchema = CustomScenarioFieldSchema | ScenarioFieldSchema<TaskOfficialScenarioFieldType>

export type EventScenarioFieldSchema = CustomScenarioFieldSchema | ScenarioFieldSchema<EventOfficialScenarioFieldType>
