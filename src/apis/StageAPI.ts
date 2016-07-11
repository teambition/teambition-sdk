'use strict'
import { Observable } from 'rxjs/Observable'
import { Observer } from 'rxjs/Observer'
import { errorHandler, makeColdSignal } from './utils'
import { default as StageFetch, StageCreateData, StageUpdateData } from '../fetchs/StageFetch'
import StageModel from '../models/StageModel'
import { StageData } from '../schemas/Stage'

export class StageAPI {

  constructor() {
    StageModel.destructor()
  }

  getAll(_tasklistId: string): Observable<StageData[]> {
    return makeColdSignal<StageData[]>(observer => {
      const get = StageModel.getStages(_tasklistId)
      if (get) {
        return get
      }
      return Observable.fromPromise(StageFetch.get(_tasklistId))
        .catch(err => errorHandler(observer, err))
        .concatMap(stages => StageModel.addStages(_tasklistId, stages))
    })
  }

  getOne(_tasklistId: string, stageId: string): Observable<StageData> {
    return makeColdSignal<StageData>(observer => {
      const get = StageModel.getOne(stageId)
      if (get) {
        return get
      }
      return Observable.fromPromise(StageFetch.get(_tasklistId, stageId))
        .catch(err => errorHandler(observer, err))
        .concatMap(stage => StageModel.addOne(stage))
    })
  }

  create(data: StageCreateData): Observable<StageData> {
    return Observable.create((observer: Observer<StageData>) => {
      Observable.fromPromise(StageFetch.create(data))
        .concatMap(stage => StageModel.addOne(stage))
        .forEach(stage => observer.next(stage))
    })
  }

  update(_stageId: string, data: StageUpdateData): Observable<StageUpdateData> {
    return Observable.create((observer: Observer<StageUpdateData>) => {
      return Observable.fromPromise(StageFetch.update(_stageId, data))
        .concatMap(stage => StageModel.update(_stageId, stage))
        .forEach(stage => observer.next(stage))
        .then(x => observer.complete())
    })
  }

  delete(_stageId: string): Observable<void> {
    return Observable.create((observer: Observer<void>) => {
      Observable.fromPromise(StageFetch.delete(_stageId))
        .concatMap(x => StageModel.delete(_stageId))
        .forEach(x => observer.next(null))
        .then(x => observer.complete())
    })
  }

  updateStageIds(_tasklistId: string, stageIds: string[]): Observable<{
    stageIds: string[]
  }> {
    return Observable.create((observer: Observer<string[]>) => {
      Observable.fromPromise(StageFetch.updateStageIds(_tasklistId, stageIds))
        .concatMap(r => StageModel.updateOrders(_tasklistId, r.stageIds))
        .forEach(x => observer.next(<any>{
          stageIds: stageIds
        }))
        .then(x => observer.complete())
    })
  }

}
