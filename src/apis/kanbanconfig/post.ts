import { KanbanConfigSchema } from '../../schemas/KanbanConfig'
import { ProjectId, ScenarioFieldConfigId } from 'teambition-types'
import { SDKFetch } from '../../SDKFetch'
import { SDK } from '../../SDK'

export function setKanbanConfigDisplayedFieldsFetch(
  this: SDKFetch,
  projectId: ProjectId,
  sfcId: ScenarioFieldConfigId,
  displayedFields: KanbanConfigSchema['displayedFields'],
) {
  return this.post<KanbanConfigSchema>(
    `kanban-configs`,
    {
      _projectId: projectId,
      _scenariofieldconfigId: sfcId,
      displayedFields,
    }
  )
}

declare module '../../SDKFetch' {
  interface SDKFetch {
    setKanbanConfigDisplayedFields:
      typeof setKanbanConfigDisplayedFieldsFetch
  }
}

SDKFetch.prototype.setKanbanConfigDisplayedFields =
  setKanbanConfigDisplayedFieldsFetch

function setKanbanConfigDisplayedFields(
  this: SDK,
  projectId: ProjectId,
  sfcId: ScenarioFieldConfigId,
  displayedFields: KanbanConfigSchema['displayedFields'],
) {
  return this.lift<KanbanConfigSchema>({
    method: 'update',
    clause: { _scenariofieldconfigId: sfcId },
    request: this.fetch.setKanbanConfigDisplayedFields(
      projectId,
      sfcId,
      displayedFields,
    ),
    tableName: 'KanbanConfig',
  })
}

declare module '../../SDK' {
  interface SDK {
    setKanbanConfigDisplayedFields:
      typeof setKanbanConfigDisplayedFields
  }
}

SDK.prototype.setKanbanConfigDisplayedFields =
  setKanbanConfigDisplayedFields
