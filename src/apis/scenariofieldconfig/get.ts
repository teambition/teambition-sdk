import { Observable } from '../../rx'

import { ScenarioFieldConfigId, OrganizationId, ScenarioFieldConfigObjectType } from 'teambition-types'
import { SDKFetch } from '../../SDKFetch'

export function getOrgScenarioFieldConfigProjectsFetch(
  this: SDKFetch,
  scenarioFieldConfigId: ScenarioFieldConfigId
): Observable<{
  totalSize: number,
  result: string[] // project names
}> {
  return this.get(
    `scenariofieldconfigs/${scenarioFieldConfigId}/projects`,
  )
}

declare module '../../SDKFetch' {
  interface SDKFetch {
    getOrgScenarioFieldConfigProjects: typeof getOrgScenarioFieldConfigProjectsFetch
  }
}

SDKFetch.prototype.getOrgScenarioFieldConfigProjects = getOrgScenarioFieldConfigProjectsFetch

export function verifyOrgScenarioFieldConfigNameFetch(
  this: SDKFetch,
  orgId: OrganizationId,
  objectType: ScenarioFieldConfigObjectType,
  name: string
): Observable<{ exists: boolean }> {
  return this.get(
    'scenariofieldconfigs/name/verify',
    { _organizationId: orgId, objectType, name }
  )
}

declare module '../../SDKFetch' {
  interface SDKFetch {
    verifyOrgScenarioFieldConfigName: typeof verifyOrgScenarioFieldConfigNameFetch
  }
}

SDKFetch.prototype.verifyOrgScenarioFieldConfigName = verifyOrgScenarioFieldConfigNameFetch
