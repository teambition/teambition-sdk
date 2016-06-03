'use strict'
import { Observable, Observer } from 'rxjs'
import { errorHandler, makeColdSignal } from './utils'
import { default as StageFetch, StageCreateData, StageUpdateData } from '../fetchs/StageFetch'
import StageModel from '../models/StageModel'
import Stage from '../schemas/Stage'

export class StageAPI {

  constructor() {
    StageModel.destructor()
  }

  getAll(_tasklistId: string): Observable<Stage[]> {
    return makeColdSignal(observer => {
      const get = StageModel.getStages(_tasklistId)
      if (get) {
        return get
      }
      return Observable.fromPromise(StageFetch.get(_tasklistId))
        .catch(err => errorHandler(observer, err))
        .concatMap(stages => StageModel.addStages(_tasklistId, stages))
    })
  }

  getOne(_tasklistId: string, stageId: string): Observable<Stage> {
    return makeColdSignal(observer => {
      const get = StageModel.getOne(stageId)
      if (get) {
        return get
      }
      return Observable.fromPromise(StageFetch.get(_tasklistId, stageId))
        .catch(err => errorHandler(observer, err))
        .concatMap(stage => StageModel.addOne(stage))
    })
  }

  create(data: StageCreateData): Observable<Stage> {
    return Observable.create((observer: Observer<Stage>) => {
      Observable.fromPromise(StageFetch.create(data))
        .concatMap(stage => StageModel.addOne(stage))
        .forEach(stage => observer.next(stage))
    })
  }

  update(_stageId: string, data: StageUpdateData): Observable<Stage> {
    return Observable.create((observer: Observer<Stage>) => {
      return Observable.fromPromise(StageFetch.update(_stageId, data))
        .concatMap(stage => StageModel.update<Stage>(_stageId, stage))
        .forEach(stage => observer.next(stage))
    })
  }

  delete(_stageId: string): Observable<void> {
    return Observable.create((observer: Observer<void>) => {
      Observable.fromPromise(StageFetch.delete(_stageId))
        .concatMap(x => StageModel.delete(_stageId))
        .forEach(x => observer.next(null))
    })
  }

}
