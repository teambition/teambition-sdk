'use strict'
import { Observable } from 'rxjs/Observable'
import { makeColdSignal } from './utils'
import { default as StageFetch, StageCreateData, StageUpdateData } from '../fetchs/StageFetch'
import StageModel from '../models/StageModel'
import { StageData } from '../schemas/Stage'

export class StageAPI {

  getAll(_tasklistId: string): Observable<StageData[]> {
    return makeColdSignal<StageData[]>(() => {
      const get = StageModel.getStages(_tasklistId)
      if (get) {
        return get
      }
      return StageFetch.get(_tasklistId)
        .concatMap(stages => StageModel.addStages(_tasklistId, stages))
    })
  }

  getOne(_tasklistId: string, stageId: string): Observable<StageData> {
    return makeColdSignal<StageData>(() => {
      const get = StageModel.getOne(stageId)
      if (get && StageModel.checkSchema(stageId)) {
        return get
      }
      return StageFetch.get(_tasklistId, stageId)
        .concatMap(stage => StageModel.addOne(stage))
    })
  }

  create(data: StageCreateData): Observable<StageData> {
    return StageFetch.create(data)
      .concatMap(stage => StageModel.addOne(stage).take(1))
  }

  update(_stageId: string, data: StageUpdateData): Observable<StageUpdateData> {
    return StageFetch.update(_stageId, data)
      .concatMap(stage => StageModel.update(_stageId, stage))
  }

  delete(_stageId: string): Observable<void> {
    return StageFetch.delete(_stageId)
      .concatMap(x => StageModel.delete(_stageId))
  }

  updateStageIds(_tasklistId: string, stageIds: string[]): Observable<{
    stageIds: string[]
  }> {
    return StageFetch.updateStageIds(_tasklistId, stageIds)
      .concatMap(r => StageModel.updateOrders(_tasklistId, r.stageIds).map(() => r))
  }
}

export default new StageAPI
