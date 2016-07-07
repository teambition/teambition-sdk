'use strict'
import { Observable } from 'rxjs/Observable'
import BaseModel from './BaseModel'
import Stage from '../schemas/Stage'
import { dataToSchema, datasToSchemas, forEach } from '../utils/index'

export class StageModel extends BaseModel {
  private _schemaName = 'Stage'

  addStages(_tasklistId: string, stages: Stage[]): Observable<Stage[]> {
    const result = datasToSchemas<Stage>(stages, Stage)
    return this._saveCollection(`tasklist:stages/${_tasklistId}`, result, this._schemaName, (data: Stage) => {
      return data._tasklistId === _tasklistId && !data.isArchived
    })
  }

  getStages(_tasklistId: string): Observable<Stage[]> {
    return this._get<Stage[]>(`tasklist:stages/${_tasklistId}`)
  }

  addOne(stage: Stage): Observable<Stage> {
    const result = dataToSchema<Stage>(stage, Stage)
    return this._save(result)
  }

  getOne(_id: string): Observable<Stage> {
    return this._get<Stage>(_id)
  }

  updateOrders(_tasklistId: string, ids: string[]): Observable<Stage[]> {
    const stages: any[] = []
    forEach(ids, (id, pos) => {
      stages.push({
        _id: id,
        order: pos
      })
    })
    return this._updateCollection<Stage>(`tasklist:stages/${_tasklistId}`, stages)
  }

}

export default new StageModel()
