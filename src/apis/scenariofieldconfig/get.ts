import { Observable } from 'rxjs/Observable'
import { QueryToken } from 'reactivedb'

import { ProjectId, ScenarioFieldConfigObjectType } from 'teambition-types'
import { SDK, CacheStrategy } from '../../SDK'
import { SDKFetch } from '../../SDKFetch'
import { ScenarioFieldConfigSchema, TaskScenarioFieldConfigSchema, EventScenarioFieldConfigSchema } from '../../schemas'

export function getScenarioFieldConfigsFetch(
  this: SDKFetch,
  projectId: ProjectId,
  objectType: 'task'
): Observable<TaskScenarioFieldConfigSchema[]>

export function getScenarioFieldConfigsFetch(
  this: SDKFetch,
  projectId: ProjectId,
  objectType: 'event'
): Observable<EventScenarioFieldConfigSchema[]>

export function getScenarioFieldConfigsFetch(
  this: SDKFetch,
  projectId: ProjectId,
  objectType: ScenarioFieldConfigObjectType
) {
  return this.get<ScenarioFieldConfigSchema[]>(
    `projects/${projectId}/scenariofieldconfigs`,
    { objectType },
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
  objectType: 'task'
): QueryToken<TaskScenarioFieldConfigSchema>

export function getScenarioFieldConfigs(
  this: SDK,
  projectId: ProjectId,
  objectType: 'event'
): QueryToken<EventScenarioFieldConfigSchema>

export function getScenarioFieldConfigs(
  this: SDK,
  projectId: ProjectId,
  objectType: ScenarioFieldConfigObjectType
):
  | QueryToken<TaskScenarioFieldConfigSchema>
  | QueryToken<EventScenarioFieldConfigSchema> {
  return this.lift<
    & TaskScenarioFieldConfigSchema
    & EventScenarioFieldConfigSchema
    >({
      cacheValidate: CacheStrategy.Request,
      tableName: 'ScenarioFieldConfig',
      request: this.fetch.getScenarioFieldConfigs(projectId, objectType as any) as any,
      query: {
        where: [
          { _projectId: projectId },
          { objectType },
        ],
      },
    }) as any
}

declare module '../../SDK' {
  // tslint:disable-next-line:no-shadowed-variable
  interface SDK {
    getScenarioFieldConfigs: typeof getScenarioFieldConfigs
  }
}

SDK.prototype.getScenarioFieldConfigs = getScenarioFieldConfigs
