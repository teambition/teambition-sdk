import { ScenarioFieldConfigId } from 'teambition-types'

import { SDK } from '../../SDK'
import { SDKFetch } from '../../SDKFetch'
import { ScenarioFieldConfigSchema } from '../../schemas'
import { normalizeScenarioFieldConfig } from './with-scenario-field-config-id'

export function updateScenarioFieldConfigFetch(
  this: SDKFetch,
  scenarioFieldConfigId: ScenarioFieldConfigId,
  scenarioFieldConfig: Partial<ScenarioFieldConfigSchema>
) {
  const url = `scenariofieldconfigs/${scenarioFieldConfigId}/info`
  const body = scenarioFieldConfig

  return this.put<typeof body>(url, body)
}

declare module '../../SDKFetch' {
  interface SDKFetch {
    updateScenarioFieldConfig: typeof updateScenarioFieldConfigFetch
  }
}

SDKFetch.prototype.updateScenarioFieldConfig = updateScenarioFieldConfigFetch

export function updateScenarioFieldConfig(
  this: SDK,
  scenarioFieldConfigId: ScenarioFieldConfigId,
  scenarioFieldConfig: Partial<ScenarioFieldConfigSchema>
) {
  const req = this.fetch
    .updateScenarioFieldConfig(scenarioFieldConfigId, scenarioFieldConfig)
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
    updateScenarioFieldConfig: typeof updateScenarioFieldConfig
  }
}

SDK.prototype.updateScenarioFieldConfig = updateScenarioFieldConfig
