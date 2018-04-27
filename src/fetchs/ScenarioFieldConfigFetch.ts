import { Observable } from 'rxjs/Observable'
import BaseFetch from './BaseFetch'
import { ProjectId, ScenarioFieldConfigObjectType } from '../app'
import { ScenarioFieldConfigData } from '../schemas/ScenarioFieldConfig'
import { TaskScenarioFieldConfigData } from '../schemas/TaskScenarioFieldConfig'
import { EventScenarioFieldConfigData } from '../schemas/EventScenarioFieldConfig'

export class ScenarioFieldConfigFetch extends BaseFetch {

  getScenarioFieldConfigs(projectId: ProjectId, objectType: 'task'): Observable<TaskScenarioFieldConfigData[]>

  getScenarioFieldConfigs(projectId: ProjectId, objectType: 'event'): Observable<EventScenarioFieldConfigData[]>

  getScenarioFieldConfigs(projectId: ProjectId, objectType: ScenarioFieldConfigObjectType): Observable<ScenarioFieldConfigData[]>

  getScenarioFieldConfigs(projectId: ProjectId, objectType: ScenarioFieldConfigObjectType): Observable<ScenarioFieldConfigData[]> {
    return this.fetch.get<ScenarioFieldConfigData[]>(
      `projects/${projectId}/scenariofieldconfigs?objectType=${objectType}`
    )
  }
}

export default new ScenarioFieldConfigFetch()
