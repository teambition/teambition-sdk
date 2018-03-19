import { Observable } from 'rxjs/Observable'
import { QueryToken } from 'reactivedb'

import { ProjectId, ScenarioFieldConfigObjectType } from 'teambition-types'
import { SDK, CacheStrategy } from '../../SDK'
import { SDKFetch } from '../../SDKFetch'
import { ScenarioFieldConfigSchema, TaskScenarioFieldConfigSchema, EventScenarioFieldConfigSchema } from '../../schemas'

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
  withTaskflowstatus = false
):
  | QueryToken<TaskScenarioFieldConfigSchema>
  | QueryToken<EventScenarioFieldConfigSchema> {
  return this.lift<
    & TaskScenarioFieldConfigSchema
    & EventScenarioFieldConfigSchema
    >({
      cacheValidate: CacheStrategy.Request,
      tableName: 'ScenarioFieldConfig',
      request: this.fetch.getScenarioFieldConfigs(
        projectId,
        objectType as any,
        withTaskflowstatus
      ) as any,
      query: {
        where: [
          { _projectId: projectId },
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
    }) as any
}

declare module '../../SDK' {
  // tslint:disable-next-line:no-shadowed-variable
  interface SDK {
    getScenarioFieldConfigs: typeof getScenarioFieldConfigs
  }
}

SDK.prototype.getScenarioFieldConfigs = getScenarioFieldConfigs
