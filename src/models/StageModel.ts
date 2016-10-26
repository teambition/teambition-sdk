'use strict'
import { Observable } from 'rxjs/Observable'
import BaseModel from './BaseModel'
import { StageData, default as Stage } from '../schemas/Stage'
import { dataToSchema, datasToSchemas, forEach } from '../utils/index'
import { StageId, TasklistId } from '../teambition'

export class StageModel extends BaseModel {
  private _schemaName = 'Stage'

  addStages(_tasklistId: TasklistId, stages: StageData[]): Observable<StageData[]> {
    const result = datasToSchemas<StageData>(stages, Stage)
    return this._saveCollection(`tasklist:stages/${_tasklistId}`, result, this._schemaName, (data: StageData) => {
      return data._tasklistId === _tasklistId && !data.isArchived
    })
  }

  getStages(_tasklistId: TasklistId): Observable<StageData[]> {
    return this._get<StageData[]>(`tasklist:stages/${_tasklistId}`)
  }

  addOne(stage: StageData): Observable<StageData> {
    const result = dataToSchema<StageData>(stage, Stage)
    return this._save(result)
  }

  getOne(_id: StageId): Observable<StageData> {
    return this._get<StageData>(<any>_id)
  }

  updateOrders(_tasklistId: TasklistId, ids: StageId[]): Observable<{
    stageIds: StageId[]
  }> {
    const stages: any[] = []
    forEach(ids, (id, pos) => {
      stages.push({
        _id: id,
        order: pos
      })
    })
    return Observable.combineLatest(
      this._updateCollection<StageData>(`tasklist:stages/${_tasklistId}`, stages),
      this.update(<any>_tasklistId, {
        stageIds: ids
      })
    ).map(r => r[1])
  }

}

export default new StageModel
