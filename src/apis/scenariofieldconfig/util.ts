import { ScenarioFieldSchema, CustomScenarioFieldSchema } from '../../schemas'

export const isCustomScenarioField = (
  it: ScenarioFieldSchema
): it is CustomScenarioFieldSchema => {
  return it.fieldType === 'customfield'
}
