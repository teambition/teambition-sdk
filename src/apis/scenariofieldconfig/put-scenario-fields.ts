import { ScenarioFieldConfigId } from 'teambition-types'

import { SDK } from '../../SDK'
import { SDKFetch } from '../../SDKFetch'
import { ScenarioFieldConfigSchema, ScenarioFieldSchema } from '../../schemas'
import { normalizeScenarioFieldConfig } from './with-scenario-field-config-id'

export function updateScenarioFieldConfigFieldsFetch(
  this: SDKFetch,
  scenarioFieldConfigId: ScenarioFieldConfigId,
  scenarioFields: Partial<ScenarioFieldSchema>[]
) {
  const url = `scenariofieldconfigs/${scenarioFieldConfigId}/scenariofields`
  const body: Pick<ScenarioFieldConfigSchema, 'scenariofields'> = {
    scenariofields: scenarioFields as ScenarioFieldSchema[]
  }

  return this.put<typeof body>(url, body)
}

declare module '../../SDKFetch' {
  interface SDKFetch {
    updateScenarioFieldConfigFields: typeof updateScenarioFieldConfigFieldsFetch
  }
}

SDKFetch.prototype.updateScenarioFieldConfigFields = updateScenarioFieldConfigFieldsFetch

export function updateScenarioFieldConfigFields(
  this: SDK,
  scenarioFieldConfigId: ScenarioFieldConfigId,
  scenarioFields: Partial<ScenarioFieldSchema>[]
) {
  const req = this.fetch
    .updateScenarioFieldConfigFields(scenarioFieldConfigId, scenarioFields)
    .pipe(normalizeScenarioFieldConfig)

  return this.lift({
    tableName: 'ScenarioFieldConfig',
    method: 'update',
    request: req,
    clause: { _id: scenarioFieldConfigId }
  })
}

declare module '../../SDK' {
  interface SDK {
    updateScenarioFieldConfigFields: typeof updateScenarioFieldConfigFields
  }
}

SDK.prototype.updateScenarioFieldConfigFields = updateScenarioFieldConfigFields
