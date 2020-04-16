import { ProjectId, ScenarioFieldConfigId } from 'teambition-types'

import { KanbanConfigSchema } from '../../schemas/KanbanConfig'
import { SDKFetch } from '../../SDKFetch'
import { SDK, CacheStrategy } from '../../SDK'

/**
 * 获取项目的看板配置
 */
export function getProjectKanbanConfigsFetch(
  this: SDKFetch,
  projectId: ProjectId
) {
  return this.get<KanbanConfigSchema[]>(`projects/${projectId}/kanbanconfigs`)
}

/**
 * 获取单个看板配置
 */
export function getKanbanConfigByScenarioIdFetch(
  this: SDKFetch,
  projectId: ProjectId,
  scenariofieldconfigId: ScenarioFieldConfigId
) {
  return this.get<KanbanConfigSchema>(`projects/${projectId}/kanbanconfigs`, {
    scenariofieldconfigId
  })
}

declare module '../../SDKFetch' {
  interface SDKFetch {
    getKanbanConfigByScenarioId: typeof getKanbanConfigByScenarioIdFetch
    getProjectKanbanConfigs: typeof getProjectKanbanConfigsFetch
  }
}

SDKFetch.prototype.getProjectKanbanConfigs = getProjectKanbanConfigsFetch
SDKFetch.prototype.getKanbanConfigByScenarioId = getKanbanConfigByScenarioIdFetch

/**
 * 获取项目的看板配置
 */
function getProjectKanbanConfigs(
  this: SDK,
  projectId: ProjectId,
) {
  return this.lift<KanbanConfigSchema>({
    cacheValidate: CacheStrategy.Request,
    query: { where: {  _projectId: projectId } },
    request: this.fetch.getProjectKanbanConfigs(projectId),
    tableName: 'KanbanConfig',
  })
}

/**
 * 获取单个看板配置
 */
function getKanbanConfigByScenarioId(
  this: SDK,
  projectId: ProjectId,
  scenariofieldconfigId: ScenarioFieldConfigId
) {
  return this.lift<KanbanConfigSchema>({
    cacheValidate: CacheStrategy.Request,
    query: {
      where: {
        _projectId: projectId,
        _scenariofieldconfigId: scenariofieldconfigId
      }
    },
    request: this.fetch.getKanbanConfigByScenarioId(
      projectId,
      scenariofieldconfigId
    ),
    tableName: 'KanbanConfig',
  })
}

declare module '../../SDK' {
  interface SDK {
    getKanbanConfigByScenarioId: typeof getKanbanConfigByScenarioId
    getProjectKanbanConfigs: typeof getProjectKanbanConfigs
  }
}

SDK.prototype.getProjectKanbanConfigs = getProjectKanbanConfigs
SDK.prototype.getKanbanConfigByScenarioId = getKanbanConfigByScenarioId
