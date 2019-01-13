import { OrganizationId, ScenarioFieldConfigId } from 'teambition-types'

import { SDK } from '../../SDK'
import { SDKFetch } from '../../SDKFetch'

function deleteOrgScenarioFieldConfigFetch(
  this: SDKFetch,
  orgId: OrganizationId,
  scenarioFieldConfigId: ScenarioFieldConfigId
) {
  const url = `organizations/${orgId}/scenariofieldconfigs/${scenarioFieldConfigId}`

  return this.delete<void>(url)
}

declare module '../../SDKFetch' {
  interface SDKFetch {
    deleteOrgScenarioFieldConfig: typeof deleteOrgScenarioFieldConfigFetch
  }
}

SDKFetch.prototype.deleteOrgScenarioFieldConfig = deleteOrgScenarioFieldConfigFetch

function deleteOrgScenarioFieldConfig(
  this: SDK,
  orgId: OrganizationId,
  scenarioFieldConfigId: ScenarioFieldConfigId
) {
  return this.lift({
    method: 'delete',
    tableName: 'ScenarioFieldConfig',
    request: this.fetch.deleteOrgScenarioFieldConfig(
      orgId,
      scenarioFieldConfigId
    ),
    clause: { _id: scenarioFieldConfigId }
  })
}

declare module '../../SDK' {
  interface SDK {
    deleteOrgScenarioFieldConfig: typeof deleteOrgScenarioFieldConfig
  }
}

SDK.prototype.deleteOrgScenarioFieldConfig = deleteOrgScenarioFieldConfig
