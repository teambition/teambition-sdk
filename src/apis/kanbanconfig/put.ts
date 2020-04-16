import { KanbanConfigId, ProjectId } from 'teambition-types'

import { KanbanConfigSchema } from '../../schemas/KanbanConfig'
import { SDKFetch } from '../../SDKFetch'
import { SDK } from '../../SDK'

/**
 * 更新看板配置系统显示字段
 */
export function updateKanbanConfigDisplayedFieldsFetch(
  this: SDKFetch,
  projectId: ProjectId,
  id: KanbanConfigId,
  displayedFields: KanbanConfigSchema['displayedFields']
) {
  return this.put<KanbanConfigSchema>(
    `projects/${projectId}/kanbanconfigs/${id}`,
    {
     displayedFields
    }
  )
}

declare module '../../SDKFetch' {
  interface SDKFetch {
    updateKanbanConfigDisplayedFields:
      typeof updateKanbanConfigDisplayedFieldsFetch
  }
}

SDKFetch.prototype.updateKanbanConfigDisplayedFields =
  updateKanbanConfigDisplayedFieldsFetch

/**
 * 更新看板配置系统显示字段
 */
function updateKanbanConfigDisplayedFields(
  this: SDK,
  projectId: ProjectId,
  id: KanbanConfigId,
  displayedFields: KanbanConfigSchema['displayedFields']
) {
  return this.lift<KanbanConfigSchema>({
    method: 'update',
    clause: { _id: id },
    request: this.fetch.updateKanbanConfigDisplayedFields(
      projectId,
      id,
      displayedFields
    ),
    tableName: 'KanbanConfig',
  })
}

declare module '../../SDK' {
  interface SDK {
    updateKanbanConfigDisplayedFields:
      typeof updateKanbanConfigDisplayedFields
  }
}

SDK.prototype.updateKanbanConfigDisplayedFields =
  updateKanbanConfigDisplayedFields
