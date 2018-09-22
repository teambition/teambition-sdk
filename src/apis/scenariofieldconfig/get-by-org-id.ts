import { map, Observable } from '../../rx'
import { QueryToken } from 'reactivedb'

import { OrganizationId, ScenarioFieldConfigObjectType } from 'teambition-types'
import { SDK, CacheStrategy } from '../../SDK'
import { SDKFetch } from '../../SDKFetch'
import { ScenarioFieldConfigSchema, TaskScenarioFieldConfigSchema, EventScenarioFieldConfigSchema } from '../../schemas'
import { ApiResult } from '../../Net'

export function getOrgScenarioFieldConfigsFetch(
  this: SDKFetch,
  organizationId: OrganizationId,
  objectType: 'task',
  query?: object
): Observable<TaskScenarioFieldConfigSchema[]>

export function getOrgScenarioFieldConfigsFetch(
  this: SDKFetch,
  organizationId: OrganizationId,
  objectType: 'event',
  query?: object
): Observable<EventScenarioFieldConfigSchema[]>

export function getOrgScenarioFieldConfigsFetch(
  this: SDKFetch,
  organizationId: OrganizationId,
  objectType: ScenarioFieldConfigObjectType,
  query?: object
): Observable<ScenarioFieldConfigSchema[]>

export function getOrgScenarioFieldConfigsFetch(
  this: SDKFetch,
  organizationId: OrganizationId,
  objectType: ScenarioFieldConfigObjectType,
  query?: object
) {
  return this.get<{ nextPageToken: string, result: ScenarioFieldConfigSchema[] }>(
    `organizations/${organizationId}/scenariofieldconfigs`,
    { ...query, objectType },
  ).pipe(map(({ result }) => result))
}

declare module '../../SDKFetch' {
  interface SDKFetch {
    getOrgScenarioFieldConfigs: typeof getOrgScenarioFieldConfigsFetch
  }
}

SDKFetch.prototype.getOrgScenarioFieldConfigs = getOrgScenarioFieldConfigsFetch

export function getOrgScenarioFieldConfigs(
  this: SDK,
  organizationId: OrganizationId,
  objectType: 'task',
  query?: object
): QueryToken<TaskScenarioFieldConfigSchema>

export function getOrgScenarioFieldConfigs(
  this: SDK,
  organizationId: OrganizationId,
  objectType: 'event',
  query?: object
): QueryToken<EventScenarioFieldConfigSchema>

export function getOrgScenarioFieldConfigs(
  this: SDK,
  organizationId: OrganizationId,
  objectType: ScenarioFieldConfigObjectType,
  query?: object
): QueryToken<ScenarioFieldConfigSchema>

export function getOrgScenarioFieldConfigs(
  this: SDK,
  organizationId: OrganizationId,
  objectType: ScenarioFieldConfigObjectType,
  query?: object
  // todo: 待 RDB 类型修复后，将 any 移除
): any {
  return this.lift({
    cacheValidate: CacheStrategy.Request,
    tableName: 'ScenarioFieldConfig',
    request: this.fetch.getOrgScenarioFieldConfigs(
      organizationId,
      objectType,
      query
    ),
    query: {
      where: [
        { _boundToObjectId: organizationId },
        { objectType },
      ],
    },
    excludeFields: ['taskflowstatuses'] // 企业接口不关心该字段
  } as ApiResult<ScenarioFieldConfigSchema, CacheStrategy.Request>)
}

declare module '../../SDK' {
  interface SDK {
    getOrgScenarioFieldConfigs: typeof getOrgScenarioFieldConfigs
  }
}

SDK.prototype.getOrgScenarioFieldConfigs = getOrgScenarioFieldConfigs
