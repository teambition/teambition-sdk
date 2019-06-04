import { Observable } from 'rxjs/Observable'

import {
  ProjectId,
  ScenarioFieldConfigObjectType,
  ScenarioFieldConfigId,
  OrganizationId,
  TaskflowId
} from 'teambition-types'
import { SDK } from '../../SDK'
import { SDKFetch } from '../../SDKFetch'
import {
  TaskScenarioFieldConfigSchema,
  EventScenarioFieldConfigSchema,
  ScenarioFieldConfigSchema
} from '../../schemas'

export function bulkAddScenarioFieldConfigsFetch(
  this: SDKFetch,
  projectId: ProjectId,
  objectType: 'task',
  scenariofieldconfigIds: ScenarioFieldConfigId[],
  taskflowId?: TaskflowId
): Observable<TaskScenarioFieldConfigSchema[]>

export function bulkAddScenarioFieldConfigsFetch(
  this: SDKFetch,
  projectId: ProjectId,
  objectType: 'event',
  scenariofieldconfigIds: ScenarioFieldConfigId[],
  taskflowId?: TaskflowId
): Observable<EventScenarioFieldConfigSchema[]>

export function bulkAddScenarioFieldConfigsFetch(
  this: SDKFetch,
  projectId: ProjectId,
  objectType: ScenarioFieldConfigObjectType,
  scenariofieldconfigIds: ScenarioFieldConfigId[],
  taskflowId?: TaskflowId
): Observable<ScenarioFieldConfigSchema[]>

export function bulkAddScenarioFieldConfigsFetch(
  this: SDKFetch,
  projectId: ProjectId,
  objectType: ScenarioFieldConfigObjectType,
  scenariofieldconfigIds: ScenarioFieldConfigId[],
  taskflowId?: TaskflowId
) {
  return this.post<ScenarioFieldConfigSchema[]>(
    `projects/${projectId}/scenariofieldconfigs/bulk`,
    { objectType, scenariofieldconfigIds, _taskflowId: taskflowId }
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
  scenariofieldconfigIds: ScenarioFieldConfigId[],
  taskflowId?: TaskflowId
): Observable<TaskScenarioFieldConfigSchema[]>

export function bulkAddScenarioFieldConfigs(
  this: SDK,
  projectId: ProjectId,
  objectType: 'event',
  scenariofieldconfigIds: ScenarioFieldConfigId[],
  taskflowId?: TaskflowId
): Observable<EventScenarioFieldConfigSchema[]>

export function bulkAddScenarioFieldConfigs(
  this: SDK,
  projectId: ProjectId,
  objectType: ScenarioFieldConfigObjectType,
  scenariofieldconfigIds: ScenarioFieldConfigId[],
  taskflowId?: TaskflowId
): Observable<ScenarioFieldConfigSchema[]>

export function bulkAddScenarioFieldConfigs(
  this: SDK,
  projectId: ProjectId,
  objectType: ScenarioFieldConfigObjectType,
  scenariofieldconfigIds: ScenarioFieldConfigId[],
  taskflowId?: TaskflowId
) {
  return this.lift({
    tableName: 'ScenarioFieldConfig',
    method: 'create',
    request: this.fetch.bulkAddScenarioFieldConfigs(
      projectId,
      objectType,
      scenariofieldconfigIds,
      taskflowId
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
  payload: Partial<ScenarioFieldConfigSchema>
): Observable<ScenarioFieldConfigSchema> {
  const url = `organizations/${orgId}/scenariofieldconfigs`
  const body = payload

  return this.post<ScenarioFieldConfigSchema>(url, body)
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
  payload: Partial<ScenarioFieldConfigSchema>
): Observable<ScenarioFieldConfigSchema> {
  return this.lift({
    tableName: 'ScenarioFieldConfig',
    method: 'create',
    request: this.fetch.createOrgScenarioFieldConfig(orgId, payload)
  })
}

declare module '../../SDK' {
  interface SDK {
    createOrgScenarioFieldConfig: typeof createOrgScenarioFieldConfig
  }
}

SDK.prototype.createOrgScenarioFieldConfig = createOrgScenarioFieldConfig
