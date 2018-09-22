import { map, Observable } from '../../rx'

import { ScenarioFieldConfigId } from 'teambition-types'
import { SDK } from '../../SDK'
import { SDKFetch } from '../../SDKFetch'
import { ScenarioFieldConfigSchema } from '../../schemas'

export function restoreScenarioFieldConfigFetch(
  this: SDKFetch,
  scenarioFieldConfigId: ScenarioFieldConfigId
): Observable<ScenarioFieldConfigSchema> {
  return this.put(
    `scenariofieldconfigs/${scenarioFieldConfigId}/restore`
  )
}

export function syncScenarioFieldConfigFetch(
  this: SDKFetch,
  scenarioFieldConfigId: ScenarioFieldConfigId
): Observable<{}> {
  return this.put(
    `scenariofieldconfigs/${scenarioFieldConfigId}/sync`
  )
}

declare module '../../SDKFetch' {
  interface SDKFetch {
    restoreScenarioFieldConfig: typeof restoreScenarioFieldConfigFetch
    syncScenarioFieldConfig: typeof syncScenarioFieldConfigFetch
  }
}

SDKFetch.prototype.restoreScenarioFieldConfig = restoreScenarioFieldConfigFetch
SDKFetch.prototype.syncScenarioFieldConfig = syncScenarioFieldConfigFetch

export function restoreScenarioFieldConfig(
  this: SDK,
  scenarioFieldConfigId: ScenarioFieldConfigId
) {
  return this.lift({
    tableName: 'ScenarioFieldConfig',
    method: 'update',
    request: this.fetch.restoreScenarioFieldConfig(
      scenarioFieldConfigId
    ),
    clause: { _id: scenarioFieldConfigId }
  })
}

export function syncScenarioFieldConfig(
  this: SDK,
  scenarioFieldConfigId: ScenarioFieldConfigId
) {
  return this.lift({
    tableName: 'ScenarioFieldConfig',
    method: 'update',
    request: this.fetch.syncScenarioFieldConfig(
      scenarioFieldConfigId
    ).pipe(map(() => ({ _id: scenarioFieldConfigId }))),
    clause: {}
  })
}

declare module '../../SDK' {
  interface SDK {
    restoreScenarioFieldConfig: typeof restoreScenarioFieldConfig
    syncScenarioFieldConfig: typeof syncScenarioFieldConfig
  }
}

SDK.prototype.restoreScenarioFieldConfig = restoreScenarioFieldConfig
SDK.prototype.syncScenarioFieldConfig = syncScenarioFieldConfig
