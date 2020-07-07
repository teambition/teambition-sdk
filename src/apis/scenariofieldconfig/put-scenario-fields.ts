import { ScenarioFieldConfigId } from 'teambition-types'

import { SDK } from '../../SDK'
import { SDKFetch } from '../../SDKFetch'
import { ScenarioFieldConfigSchema, ScenarioFieldSchema, BasicScenarioFieldSchema } from '../../schemas'

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

export function updateScenarioFieldConfigBasicFieldsFetch(
  this: SDKFetch,
  scenarioFieldConfigId: ScenarioFieldConfigId,
  basicfields: Partial<BasicScenarioFieldSchema>[]
) {
  const url = `scenariofieldconfigs/${scenarioFieldConfigId}/basicfields`
  const body: Pick<ScenarioFieldConfigSchema, 'basicfields'> = {
    basicfields: basicfields as BasicScenarioFieldSchema[]
  }

  return this.put<typeof body>(url, body)
}

declare module '../../SDKFetch' {
  interface SDKFetch {
    updateScenarioFieldConfigFields: typeof updateScenarioFieldConfigFieldsFetch
    updateScenarioFieldConfigBasicFields: typeof updateScenarioFieldConfigBasicFieldsFetch
  }
}

SDKFetch.prototype.updateScenarioFieldConfigFields = updateScenarioFieldConfigFieldsFetch
SDKFetch.prototype.updateScenarioFieldConfigBasicFields = updateScenarioFieldConfigBasicFieldsFetch

export function updateScenarioFieldConfigFields(
  this: SDK,
  scenarioFieldConfigId: ScenarioFieldConfigId,
  scenarioFields: Partial<ScenarioFieldSchema>[]
) {
  return this.lift({
    tableName: 'ScenarioFieldConfig',
    method: 'update',
    request: this.fetch.updateScenarioFieldConfigFields(
      scenarioFieldConfigId,
      scenarioFields
    ),
    clause: { _id: scenarioFieldConfigId }
  })
}

export function updateScenarioFieldConfigBasicFields(
  this: SDK,
  scenarioFieldConfigId: ScenarioFieldConfigId,
  basicfields: Partial<BasicScenarioFieldSchema>[]
) {
  return this.lift({
    tableName: 'ScenarioFieldConfig',
    method: 'update',
    request: this.fetch.updateScenarioFieldConfigBasicFields(
      scenarioFieldConfigId,
      basicfields
    ),
    clause: { _id: scenarioFieldConfigId }
  })
}

declare module '../../SDK' {
  interface SDK {
    updateScenarioFieldConfigFields: typeof updateScenarioFieldConfigFields
    updateScenarioFieldConfigBasicFields: typeof updateScenarioFieldConfigBasicFields
  }
}

SDK.prototype.updateScenarioFieldConfigFields = updateScenarioFieldConfigFields
SDK.prototype.updateScenarioFieldConfigBasicFields = updateScenarioFieldConfigBasicFields
