'use strict'
import {Observable, Observer} from 'rxjs'
import {StageFetch, StageCreateData, StageUpdateData} from '../fetchs/StageFetch'
import StageModel from '../models/StageModel'
import Stage from '../schemas/Stage'

const stageFetch = new StageFetch()

export class StageAPI {

  constructor() {
    StageModel.$destroy()
  }

  getAll(_tasklistId: string): Observable<Stage[]> {
    const get = StageModel.getStages(_tasklistId)
    if (get) {
      return get
    }
    return Observable.fromPromise(stageFetch.get(_tasklistId))
      .concatMap(stages => StageModel.addStages(_tasklistId, stages))
  }

  getOne(_tasklistId: string, stageId: string): Observable<Stage> {
    const get = StageModel.getOne(stageId)
    if (get) {
      return get
    }
    return Observable.fromPromise(stageFetch.get(_tasklistId, stageId))
      .concatMap(stage => StageModel.add(stage))
  }

  create(data: StageCreateData): Observable<Stage> {
    return Observable.create((observer: Observer<Stage>) => {
      Observable.fromPromise(stageFetch.create(data))
        .concatMap(stage => StageModel.add(stage))
        .forEach(stage => observer.next(stage))
    })
  }

  update(_stageId: string, data: StageUpdateData): Observable<Stage> {
    return Observable.create((observer: Observer<Stage>) => {
      return Observable.fromPromise(stageFetch.update(_stageId, data))
        .concatMap(stage => StageModel.update<Stage>(_stageId, stage))
        .forEach(stage => observer.next(stage))
    })
  }

  delete(_stageId: string): Observable<void> {
    return Observable.create((observer: Observer<void>) => {
      Observable.fromPromise(stageFetch.delete(_stageId))
        .concatMap(x => StageModel.delete(_stageId))
        .forEach(x => observer.next(null))
    })
  }

}
