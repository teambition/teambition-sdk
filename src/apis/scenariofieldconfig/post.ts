import { Observable } from '../../rx'

import { ProjectId, ScenarioFieldConfigObjectType, ScenarioFieldConfigId, OrganizationId } from 'teambition-types'
import { SDK } from '../../SDK'
import { SDKFetch } from '../../SDKFetch'
import { TaskScenarioFieldConfigSchema, EventScenarioFieldConfigSchema, ScenarioFieldConfigSchema } from '../../schemas'

export function bulkAddScenarioFieldConfigsFetch(
  this: SDKFetch,
  projectId: ProjectId,
  objectType: 'task',
  scenariofieldconfigIds: ScenarioFieldConfigId[]
): Observable<TaskScenarioFieldConfigSchema[]>

export function bulkAddScenarioFieldConfigsFetch(
  this: SDKFetch,
  projectId: ProjectId,
  objectType: 'event',
  scenariofieldconfigIds: ScenarioFieldConfigId[]
): Observable<EventScenarioFieldConfigSchema[]>

export function bulkAddScenarioFieldConfigsFetch(
  this: SDKFetch,
  projectId: ProjectId,
  objectType: ScenarioFieldConfigObjectType,
  scenariofieldconfigIds: ScenarioFieldConfigId[]
): Observable<ScenarioFieldConfigSchema[]>

export function bulkAddScenarioFieldConfigsFetch(
  this: SDKFetch,
  projectId: ProjectId,
  objectType: ScenarioFieldConfigObjectType,
  scenariofieldconfigIds: ScenarioFieldConfigId[]
) {
  return this.post<ScenarioFieldConfigSchema[]>(
    `projects/${projectId}/scenariofieldconfigs/bulk`,
    { objectType, scenariofieldconfigIds },
  )
}

declare module '../../SDKFetch' {
  interface SDKFetch {
    bulkAddScenarioFieldConfigs: typeof bulkAddScenarioFieldConfigsFetch
  }
}

SDKFetch.prototype.bulkAddScenarioFieldConfigs = bulkAddScenarioFieldConfigsFetch

export function bulkAddScenarioFieldConfigs(
  this: SDK,
  projectId: ProjectId,
  objectType: 'task',
  scenariofieldconfigIds: ScenarioFieldConfigId[]
): Observable<TaskScenarioFieldConfigSchema[]>

export function bulkAddScenarioFieldConfigs(
  this: SDK,
  projectId: ProjectId,
  objectType: 'event',
  scenariofieldconfigIds: ScenarioFieldConfigId[]
): Observable<EventScenarioFieldConfigSchema[]>

export function bulkAddScenarioFieldConfigs(
  this: SDK,
  projectId: ProjectId,
  objectType: ScenarioFieldConfigObjectType,
  scenariofieldconfigIds: ScenarioFieldConfigId[]
): Observable<ScenarioFieldConfigSchema[]>

export function bulkAddScenarioFieldConfigs(
  this: SDK,
  projectId: ProjectId,
  objectType: ScenarioFieldConfigObjectType,
  scenariofieldconfigIds: ScenarioFieldConfigId[]
) {
  return this.lift({
    tableName: 'ScenarioFieldConfig',
    method: 'create',
    request: this.fetch.bulkAddScenarioFieldConfigs(
      projectId,
      objectType,
      scenariofieldconfigIds
    )
  })
}

declare module '../../SDK' {
  interface SDK {
    bulkAddScenarioFieldConfigs: typeof bulkAddScenarioFieldConfigs
  }
}

SDK.prototype.bulkAddScenarioFieldConfigs = bulkAddScenarioFieldConfigs

export function createOrgScenarioFieldConfigFetch(
  this: SDKFetch,
  orgId: OrganizationId,
  payload: Pick<ScenarioFieldConfigSchema, 'objectType' | 'name' | 'icon' | 'scenariofields'>
): Observable<ScenarioFieldConfigSchema> {
  return this.post(
    `organizations/${orgId}/scenariofieldconfigs`,
    payload
  )
}

declare module '../../SDKFetch' {
  interface SDKFetch {
    createOrgScenarioFieldConfig: typeof createOrgScenarioFieldConfigFetch
  }
}

SDKFetch.prototype.createOrgScenarioFieldConfig = createOrgScenarioFieldConfigFetch

export function createOrgScenarioFieldConfig(
  this: SDK,
  orgId: OrganizationId,
  payload: Pick<ScenarioFieldConfigSchema, 'objectType' | 'name' | 'icon' | 'scenariofields'>
) {
  return this.lift({
    tableName: 'ScenarioFieldConfig',
    method: 'create',
    request: this.fetch.createOrgScenarioFieldConfig(
      orgId,
      payload
    )
  })
}

declare module '../../SDK' {
  interface SDK {
    createOrgScenarioFieldConfig: typeof createOrgScenarioFieldConfig
  }
}

SDK.prototype.createOrgScenarioFieldConfig = createOrgScenarioFieldConfig
