import { Observable } from 'rxjs/Observable'
import { ProjectId, ScenarioFieldConfigObjectType } from '../teambition'
import ScenarioFieldConfigFetch from '../fetchs/ScenarioFieldConfigFetch'
import ScenarioFieldConfigModel from '../models/ScenarioFieldConfigModel'
import { ScenarioFieldConfigData } from '../schemas/ScenarioFieldConfig'
import { TaskScenarioFieldConfigData } from '../schemas/TaskScenarioFieldConfig'
import { EventScenarioFieldConfigData } from '../schemas/EventScenarioFieldConfig'
import { makeColdSignal } from './utils'

export class ScenarioFieldConfigAPI {

  getScenarioFieldConfigs(projectId: ProjectId, objectType: 'task'): Observable<TaskScenarioFieldConfigData[]>
  getScenarioFieldConfigs(projectId: ProjectId, objectType: 'event'): Observable<EventScenarioFieldConfigData[]>
  getScenarioFieldConfigs(projectId: ProjectId, objectType: ScenarioFieldConfigObjectType): Observable<ScenarioFieldConfigData[]>

  getScenarioFieldConfigs(projectId: ProjectId, objectType: ScenarioFieldConfigObjectType): Observable<ScenarioFieldConfigData[]> {
    return makeColdSignal(() => {
      const cache = ScenarioFieldConfigModel.getScenarioFieldConfigs(projectId, objectType)
      if (cache) return cache
      return ScenarioFieldConfigFetch.getScenarioFieldConfigs(projectId, objectType)
        .concatMap((configs) => {
          return ScenarioFieldConfigModel.saveScenarioFieldConfigs(projectId, objectType, configs)
        })
    })
  }
}

export default new ScenarioFieldConfigAPI()
