import {
  CustomFieldId,
  CustomScenarioFieldType,
  EventOfficialScenarioFieldType,
  RoleId,
  ScenarioFieldId,
  ScenarioFieldType,
  TaskOfficialScenarioFieldType
} from 'teambition-types'

export interface ScenarioFieldSchema<T = ScenarioFieldType> {
  _id: ScenarioFieldId
  fieldType: T
  _roleIds: RoleId[]
  displayed: boolean
  required: boolean
}

export interface NoteScenarioFieldSchema extends ScenarioFieldSchema {
  fieldType: 'note'
  default: string
}

export interface CustomScenarioFieldSchema extends ScenarioFieldSchema<CustomScenarioFieldType> {
  _customfieldId: CustomFieldId
}

export type TaskScenarioFieldSchema =
  CustomScenarioFieldSchema |
  NoteScenarioFieldSchema |
  ScenarioFieldSchema<TaskOfficialScenarioFieldType>

export type EventScenarioFieldSchema =
  CustomScenarioFieldSchema |
  NoteScenarioFieldSchema |
  ScenarioFieldSchema<EventOfficialScenarioFieldType>
