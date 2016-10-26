'use strict'
import { Observable } from 'rxjs/Observable'
import { makeColdSignal } from './utils'
import { default as StageFetch, StageCreateData, StageUpdateData } from '../fetchs/StageFetch'
import StageModel from '../models/StageModel'
import { StageData } from '../schemas/Stage'
import { StageId, TasklistId } from '../teambition'

export class StageAPI {

  getAll(_tasklistId: TasklistId): Observable<StageData[]> {
    return makeColdSignal<StageData[]>(() => {
      const get = StageModel.getStages(_tasklistId)
      if (get) {
        return get
      }
      return StageFetch.get(_tasklistId)
        .concatMap(stages => StageModel.addStages(_tasklistId, stages))
    })
  }

  getOne(_tasklistId: TasklistId, stageId: StageId): Observable<StageData> {
    return makeColdSignal<StageData>(() => {
      const get = StageModel.getOne(stageId)
      if (get && StageModel.checkSchema(<any>stageId)) {
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

  update(_stageId: StageId, data: StageUpdateData): Observable<StageUpdateData> {
    return StageFetch.update(_stageId, data)
      .concatMap(stage => StageModel.update(<any>_stageId, stage))
  }

  delete(_stageId: StageId): Observable<void> {
    return StageFetch.delete(_stageId)
      .concatMap(x => StageModel.delete(<any>_stageId))
  }

  updateStageIds(_tasklistId: TasklistId, stageIds: StageId[]): Observable<{
    stageIds: StageId[]
  }> {
    return StageFetch.updateStageIds(_tasklistId, stageIds)
      .concatMap(r => StageModel.updateOrders(_tasklistId, r.stageIds).map(() => r))
  }
}
