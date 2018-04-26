import { Observable } from 'rxjs/Observable'
import BaseModel from './BaseModel'
import { ScenarioFieldConfigData } from '../schemas/ScenarioFieldConfig'
import ScenarioFieldConfig from '../schemas/ScenarioFieldConfig'
import TaskScenarioFieldConfig from '../schemas/TaskScenarioFieldConfig'
import EventScenarioFieldConfig from '../schemas/EventScenarioFieldConfig'
import { ProjectId, ScenarioFieldConfigObjectType } from '../teambition'
import { datasToSchemas } from '../utils'
import { TaskScenarioFieldConfigData } from '../schemas/TaskScenarioFieldConfig'
import { EventScenarioFieldConfigData } from '../schemas/EventScenarioFieldConfig'

export class ScenarioFieldConfigModel extends BaseModel {
  private _schemaName = 'ScenarioFieldConfig'

  saveScenarioFieldConfigs(
    projectId: ProjectId,
    objectType: 'task',
    configs: TaskScenarioFieldConfigData[]
  ): Observable<TaskScenarioFieldConfigData[]>

  saveScenarioFieldConfigs(
    projectId: ProjectId,
    objectType: 'event',
    configs: EventScenarioFieldConfigData[]
  ): Observable<EventScenarioFieldConfigData[]>

  saveScenarioFieldConfigs(
    projectId: ProjectId,
    objectType: ScenarioFieldConfigObjectType,
    configs: ScenarioFieldConfigData[]
  ): Observable<ScenarioFieldConfigData[]>

  saveScenarioFieldConfigs(
    projectId: ProjectId,
    objectType: ScenarioFieldConfigObjectType,
    configs: ScenarioFieldConfigData[]
  ): Observable<ScenarioFieldConfigData[]> {
    const index = `scenariofieldconfigs:${objectType}/${projectId}`

    let schemaName = this._schemaName
    let schema = ScenarioFieldConfig
    switch (objectType) {
      case 'task':
        schemaName = 'TaskScenarioFieldConfig'
        schema = TaskScenarioFieldConfig
        break
      case 'event':
        schemaName = 'EventScenarioFieldConfig'
        schema = EventScenarioFieldConfig
        break
    }

    return this._saveCollection<ScenarioFieldConfigData>(
      index,
      datasToSchemas(configs, schema),
      schemaName,
      (config) => {
        return config._projectId === projectId
          && config.objectType === objectType
      }
    )
  }

  getScenarioFieldConfigs(projectId: ProjectId, objectType: 'task'): Observable<TaskScenarioFieldConfigData[]>

  getScenarioFieldConfigs(projectId: ProjectId, objectType: 'event'): Observable<EventScenarioFieldConfigData[]>

  getScenarioFieldConfigs(projectId: ProjectId, objectType: ScenarioFieldConfigObjectType): Observable<ScenarioFieldConfigData[]>

  getScenarioFieldConfigs(projectId: ProjectId, objectType: ScenarioFieldConfigObjectType): Observable<ScenarioFieldConfigData[]> {
    const index = `scenariofieldconfigs:${objectType}/${projectId}`
    return this._get<ScenarioFieldConfigData[]>(index)
  }
}

export default new ScenarioFieldConfigModel()
