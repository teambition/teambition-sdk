import { Observable } from 'rxjs'
import { QueryToken } from 'reactivedb'

import { ProjectId, ScenarioFieldConfigObjectType } from 'teambition-types'
import { SDK, CacheStrategy } from '../../SDK'
import { SDKFetch } from '../../SDKFetch'
import { ScenarioFieldConfigSchema, TaskScenarioFieldConfigSchema, EventScenarioFieldConfigSchema } from '../../schemas'
import { ApiResult } from '../../Net'

export function getScenarioFieldConfigsFetch(
  this: SDKFetch,
  projectId: ProjectId,
  objectType: 'task',
  withTaskflowstatus?: boolean
): Observable<TaskScenarioFieldConfigSchema[]>

export function getScenarioFieldConfigsFetch(
  this: SDKFetch,
  projectId: ProjectId,
  objectType: 'event',
  withTaskflowstatus?: boolean
): Observable<EventScenarioFieldConfigSchema[]>

export function getScenarioFieldConfigsFetch(
  this: SDKFetch,
  projectId: ProjectId,
  objectType: ScenarioFieldConfigObjectType,
  withTaskflowstatus?: boolean
): Observable<ScenarioFieldConfigSchema[]>

export function getScenarioFieldConfigsFetch(
  this: SDKFetch,
  projectId: ProjectId,
  objectType: ScenarioFieldConfigObjectType,
  withTaskflowstatus = false
) {
  return this.get<ScenarioFieldConfigSchema[]>(
    `projects/${projectId}/scenariofieldconfigs`,
    { objectType, withTaskflowstatus },
  )
}

declare module '../../SDKFetch' {
  // tslint:disable-next-line:no-shadowed-variable
  interface SDKFetch {
    getScenarioFieldConfigs: typeof getScenarioFieldConfigsFetch
  }
}

SDKFetch.prototype.getScenarioFieldConfigs = getScenarioFieldConfigsFetch

export function getScenarioFieldConfigs(
  this: SDK,
  projectId: ProjectId,
  objectType: 'task',
  withTaskflowstatus?: boolean
): QueryToken<TaskScenarioFieldConfigSchema>

export function getScenarioFieldConfigs(
  this: SDK,
  projectId: ProjectId,
  objectType: 'event',
  withTaskflowstatus?: boolean
): QueryToken<EventScenarioFieldConfigSchema>

export function getScenarioFieldConfigs(
  this: SDK,
  projectId: ProjectId,
  objectType: ScenarioFieldConfigObjectType,
  withTaskflowstatus?: boolean
): QueryToken<ScenarioFieldConfigSchema>

export function getScenarioFieldConfigs(
  this: SDK,
  projectId: ProjectId,
  objectType: ScenarioFieldConfigObjectType,
  withTaskflowstatus = false
  // todo: 待 RDB 类型修复后，将 any 移除
): any {
  return this.lift({
    cacheValidate: CacheStrategy.Request,
    tableName: 'ScenarioFieldConfig',
    request: this.fetch.getScenarioFieldConfigs(
      projectId,
      objectType,
      withTaskflowstatus
    ),
    query: {
      where: [
        { _boundToObjectId: projectId },
        { objectType },
      ],
    },
    assocFields: {
      ...(
        withTaskflowstatus
          ? { taskflowstatuses: ['_id', '_taskflowId', 'name', 'kind', 'rejectStatusIds', 'pos'] }
          : {}
      )
    }
  } as ApiResult<ScenarioFieldConfigSchema, CacheStrategy.Request>)
}

declare module '../../SDK' {
  // tslint:disable-next-line:no-shadowed-variable
  interface SDK {
    getScenarioFieldConfigs: typeof getScenarioFieldConfigs
  }
}

SDK.prototype.getScenarioFieldConfigs = getScenarioFieldConfigs
