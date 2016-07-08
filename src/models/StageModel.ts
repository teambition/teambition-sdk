'use strict'
import { Observable } from 'rxjs/Observable'
import BaseModel from './BaseModel'
import { StageData, default as Stage } from '../schemas/Stage'
import { dataToSchema, datasToSchemas, forEach } from '../utils/index'

export class StageModel extends BaseModel {
  private _schemaName = 'Stage'

  addStages(_tasklistId: string, stages: StageData[]): Observable<StageData[]> {
    const result = datasToSchemas<StageData>(stages, Stage)
    return this._saveCollection(`tasklist:stages/${_tasklistId}`, result, this._schemaName, (data: StageData) => {
      return data._tasklistId === _tasklistId && !data.isArchived
    })
  }

  getStages(_tasklistId: string): Observable<StageData[]> {
    return this._get<StageData[]>(`tasklist:stages/${_tasklistId}`)
  }

  addOne(stage: StageData): Observable<StageData> {
    const result = dataToSchema<StageData>(stage, Stage)
    return this._save(result)
  }

  getOne(_id: string): Observable<StageData> {
    return this._get<StageData>(_id)
  }

  updateOrders(_tasklistId: string, ids: string[]): Observable<StageData[]> {
    const stages: any[] = []
    forEach(ids, (id, pos) => {
      stages.push({
        _id: id,
        order: pos
      })
    })
    return this._updateCollection<StageData>(`tasklist:stages/${_tasklistId}`, stages)
  }

}

export default new StageModel()
