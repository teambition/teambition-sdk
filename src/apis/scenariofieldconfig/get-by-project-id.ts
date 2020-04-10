import { Observable } from 'rxjs/Observable'

import { ProjectId, ScenarioFieldConfigObjectType } from 'teambition-types'
import { SDK, CacheStrategy } from '../../SDK'
import { SDKFetch } from '../../SDKFetch'
import {
  ScenarioFieldConfigSchema,
  TaskScenarioFieldConfigSchema,
  EventScenarioFieldConfigSchema,
  TestcaseScenarioFieldConfigSchema,
} from '../../schemas'
import { ApiResult } from '../../Net'
import { withCustomFields } from './with-custom-fields'

export function getScenarioFieldConfigsFetch(
  this: SDKFetch,
  projectId: ProjectId,
  objectType: 'task',
  options?: GetScenarioFieldConfigsFetchOptions
): Observable<TaskScenarioFieldConfigSchema[]>

export function getScenarioFieldConfigsFetch(
  this: SDKFetch,
  projectId: ProjectId,
  objectType: 'event',
  options?: GetScenarioFieldConfigsFetchOptions
): Observable<EventScenarioFieldConfigSchema[]>

export function getScenarioFieldConfigsFetch(
  this: SDKFetch,
  projectId: ProjectId,
  objectType: 'testcase',
  options?: GetScenarioFieldConfigsFetchOptions
): Observable<TestcaseScenarioFieldConfigSchema[]>

export function getScenarioFieldConfigsFetch(
  this: SDKFetch,
  projectId: ProjectId,
  objectType: ScenarioFieldConfigObjectType,
  options?: GetScenarioFieldConfigsFetchOptions
): Observable<ScenarioFieldConfigSchema[]>

export function getScenarioFieldConfigsFetch(
  this: SDKFetch,
  projectId: ProjectId,
  objectType: ScenarioFieldConfigObjectType,
  {
    appendCommonGroupChoices,
    withTaskflowstatus,
    withCustomfields = true,
  }: GetScenarioFieldConfigsFetchOptions = {}
) {
  const url = `projects/${projectId}/scenariofieldconfigs`
  const query = {
    objectType,
    withTaskflowstatus,
    withCustomfields,
    appendCommonGroupChoices,
  }

  return this.get<ScenarioFieldConfigSchema[]>(url, query)
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
): Observable<TaskScenarioFieldConfigSchema[]>

export function getScenarioFieldConfigs(
  this: SDK,
  projectId: ProjectId,
  objectType: 'event',
  options?: GetScenarioFieldConfigsOptions
): Observable<EventScenarioFieldConfigSchema[]>

export function getScenarioFieldConfigs(
  this: SDK,
  projectId: ProjectId,
  objectType: 'testcase',
  options?: GetScenarioFieldConfigsOptions
): Observable<TestcaseScenarioFieldConfigSchema[]>

export function getScenarioFieldConfigs(
  this: SDK,
  projectId: ProjectId,
  objectType: ScenarioFieldConfigObjectType,
  options?: GetScenarioFieldConfigsOptions
): Observable<ScenarioFieldConfigSchema[]>

export function getScenarioFieldConfigs(
  this: SDK,
  projectId: ProjectId,
  objectType: ScenarioFieldConfigObjectType,
  options: GetScenarioFieldConfigsOptions = {}
): Observable<ScenarioFieldConfigSchema[]> {
  const token = this.lift({
    cacheValidate: CacheStrategy.Request,
    tableName: 'ScenarioFieldConfig',
    request: this.fetch.getScenarioFieldConfigs(projectId, objectType, {
      ...options,
      withCustomfields: true,
    }),
    query: {
      where: [{ _boundToObjectId: projectId }, { objectType }],
    },
    assocFields: {
      ...(options.withTaskflowstatus
        ? {
            taskflowstatuses: [
              '_id',
              '_taskflowId',
              'name',
              'kind',
              'rejectStatusIds',
              'hasTaskflowEngineConfig',
              'pos',
            ],
          }
        : {}),
    },
  } as ApiResult<ScenarioFieldConfigSchema, CacheStrategy.Request>)

  return token.changes().pipe(withCustomFields(this, options))
}

declare module '../../SDK' {
  // tslint:disable-next-line:no-shadowed-variable
  interface SDK {
    getScenarioFieldConfigs: typeof getScenarioFieldConfigs
  }
}

SDK.prototype.getScenarioFieldConfigs = getScenarioFieldConfigs

export interface GetScenarioFieldConfigsOptions {
  appendCommonGroupChoices?: boolean
  withTaskflowstatus?: boolean
}

export interface GetScenarioFieldConfigsFetchOptions {
  appendCommonGroupChoices?: boolean
  withTaskflowstatus?: boolean
  withCustomfields?: boolean
}
