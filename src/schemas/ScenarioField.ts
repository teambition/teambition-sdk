import {
  CustomFieldId,
  CustomScenarioFieldType,
  EventOfficialScenarioFieldType,
  RoleId,
  ScenarioFieldId,
  ScenarioFieldType,
  TaskOfficialScenarioFieldType,
  TestcaseOfficialScenarioFieldType,
} from 'teambition-types'
import { CustomFieldSchema } from './CustomField'

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
  customfield?: CustomFieldSchema | null // 返回 null 表示该字段不存在已经被删了
}

export type TaskScenarioFieldSchema =
  CustomScenarioFieldSchema |
  NoteScenarioFieldSchema |
  ScenarioFieldSchema<TaskOfficialScenarioFieldType>

export type EventScenarioFieldSchema =
  CustomScenarioFieldSchema |
  NoteScenarioFieldSchema |
  ScenarioFieldSchema<EventOfficialScenarioFieldType>

export type TestcaseScenarioFieldSchema =
  ScenarioFieldSchema<TestcaseOfficialScenarioFieldType>
