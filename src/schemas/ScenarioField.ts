import { SchemaDef, RDBType, Relationship } from 'reactivedb/interface'
import { schemaColl } from './schemas'
import {
  CustomFieldId,
  CustomScenarioFieldType,
  EventOfficialScenarioFieldType,
  RoleId,
  ScenarioFieldId,
  ScenarioFieldType,
  TaskOfficialScenarioFieldType,
  ScenarioFieldConfigId
} from 'teambition-types'
import { CustomFieldSchema } from './CustomField'

export interface ScenarioFieldSchema<T = ScenarioFieldType> {
  _id: ScenarioFieldId
  _roleIds: RoleId[]
  _scenariofieldconfigId?: ScenarioFieldConfigId
  displayed: boolean
  fieldType: T
  required: boolean
}

export interface NoteScenarioFieldSchema extends ScenarioFieldSchema {
  fieldType: 'note'
  default: string
}

export interface CustomScenarioFieldSchema
  extends ScenarioFieldSchema<CustomScenarioFieldType> {
  _customfieldId: CustomFieldId
  customfield?: CustomFieldSchema
}

export type TaskScenarioFieldSchema =
  | CustomScenarioFieldSchema
  | NoteScenarioFieldSchema
  | ScenarioFieldSchema<TaskOfficialScenarioFieldType>

export type EventScenarioFieldSchema =
  | CustomScenarioFieldSchema
  | NoteScenarioFieldSchema
  | ScenarioFieldSchema<EventOfficialScenarioFieldType>

const schema: SchemaDef<
  ScenarioFieldSchema | CustomScenarioFieldSchema | NoteScenarioFieldSchema
> = {
  _id: { type: RDBType.STRING, primaryKey: true },
  _roleIds: { type: RDBType.LITERAL_ARRAY },
  _scenariofieldconfigId: { type: RDBType.STRING },
  customfield: {
    type: Relationship.oneToOne,
    virtual: {
      name: 'CustomField',
      where: (
        customField: CustomFieldSchema
      ): Partial<CustomScenarioFieldSchema> => ({
        _customfieldId: customField._id
      })
    }
  },
  default: { type: RDBType.STRING },
  displayed: { type: RDBType.BOOLEAN },
  fieldType: { type: RDBType.STRING },
  required: { type: RDBType.BOOLEAN }
}

schemaColl.add({ schema, name: 'ScenarioField' })
