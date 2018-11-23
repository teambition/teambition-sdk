import { Observable } from 'rxjs/Observable'
import { QueryToken } from 'reactivedb'

import { ProjectId, ScenarioFieldConfigObjectType } from 'teambition-types'
import { SDK, CacheStrategy } from '../../SDK'
import { SDKFetch } from '../../SDKFetch'
import {
  ScenarioFieldConfigSchema,
  TaskScenarioFieldConfigSchema,
  EventScenarioFieldConfigSchema
} from '../../schemas'
import { ApiResult } from '../../Net'
import { normalizeScenarioFieldConfigs } from './with-custom-fields'

export function getScenarioFieldConfigsFetch(
  this: SDKFetch,
  projectId: ProjectId,
  objectType: 'task',
  options?: GetScenarioFieldConfigsOptions
): Observable<TaskScenarioFieldConfigSchema[]>

export function getScenarioFieldConfigsFetch(
  this: SDKFetch,
  projectId: ProjectId,
  objectType: 'event',
  options?: GetScenarioFieldConfigsOptions
): Observable<EventScenarioFieldConfigSchema[]>

export function getScenarioFieldConfigsFetch(
  this: SDKFetch,
  projectId: ProjectId,
  objectType: ScenarioFieldConfigObjectType,
  options?: GetScenarioFieldConfigsOptions
): Observable<ScenarioFieldConfigSchema[]>

export function getScenarioFieldConfigsFetch(
  this: SDKFetch,
  projectId: ProjectId,
  objectType: ScenarioFieldConfigObjectType,
  options: GetScenarioFieldConfigsOptions = {}
) {
  const withTaskflowstatus = options.withTaskflowstatus
  const withCustomfields = options.withCustomfields

  return this.get<ScenarioFieldConfigSchema[]>(
    `projects/${projectId}/scenariofieldconfigs`,
    { objectType, withTaskflowstatus, withCustomfields }
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
  options?: GetScenarioFieldConfigsOptions
): QueryToken<TaskScenarioFieldConfigSchema>

export function getScenarioFieldConfigs(
  this: SDK,
  projectId: ProjectId,
  objectType: 'event',
  options?: GetScenarioFieldConfigsOptions
): QueryToken<EventScenarioFieldConfigSchema>

export function getScenarioFieldConfigs(
  this: SDK,
  projectId: ProjectId,
  objectType: ScenarioFieldConfigObjectType,
  options?: GetScenarioFieldConfigsOptions
): QueryToken<ScenarioFieldConfigSchema>

export function getScenarioFieldConfigs(
  this: SDK,
  projectId: ProjectId,
  objectType: ScenarioFieldConfigObjectType,
  options: GetScenarioFieldConfigsOptions = {}
  // todo: 待 RDB 类型修复后，将 any 移除
): any {
  const req = this.fetch
    .getScenarioFieldConfigs(projectId, objectType, options)
    .pipe(normalizeScenarioFieldConfigs)

  return this.lift({
    cacheValidate: CacheStrategy.Request,
    tableName: 'ScenarioFieldConfig',
    request: req,
    query: {
      where: [{ _boundToObjectId: projectId }, { objectType }]
    },
    assocFields: {
      scenariofields: [
        '_customfieldId',
        '_id',
        '_roleIds',
        '_scenariofieldconfigId',
        'default',
        'displayed',
        'fieldType',
        'required',
        ...(options.withCustomfields ? ['customfield'] : [])
      ],
      ...(options.withTaskflowstatus
        ? {
            taskflowstatuses: [
              '_id',
              '_taskflowId',
              'name',
              'kind',
              'rejectStatusIds',
              'pos'
            ]
          }
        : {})
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

export interface GetScenarioFieldConfigsOptions {
  withTaskflowstatus?: boolean
  withCustomfields?: boolean
}
