'use strict'
import { Observable, Observer } from 'rxjs'
import { default as TasklistFetch, UpdateTasklistOptions } from '../fetchs/TasklistFetch'
import TasklistModel from '../models/TasklistModel'
import StageModel from '../models/StageModel'
import Tasklist from '../schemas/Tasklist'
import { errorHandler, makeColdSignal } from './utils'

export class TasklistAPI {

  constructor() {
    TasklistModel.destructor()
  }

  getTasklists(_projectId: string, query?: any): Observable<Tasklist[]> {
    return makeColdSignal<Tasklist[]>(observer => {
      const get = TasklistModel.getTasklists(_projectId)
      if (get) {
        return get
      }
      return Observable.fromPromise(TasklistFetch.getTasklists(_projectId, query))
        .catch(err => errorHandler(observer, err))
        .concatMap(tasklists => TasklistModel.addTasklists(_projectId, tasklists))
    })
  }

  getOne(_tasklistId: string, query?: any): Observable<Tasklist> {
    return makeColdSignal<Tasklist>(observer => {
      const get = TasklistModel.getOne(_tasklistId)
      if (get) {
        return get
      }
      return Observable.fromPromise(TasklistFetch.get(_tasklistId, query))
        .catch(err => errorHandler(observer, err))
        .concatMap(tasklist => TasklistModel.addOne(tasklist))
    })
  }

  update(_tasklistId: string, patch: UpdateTasklistOptions): Observable<Tasklist> {
    return Observable.create((observer: Observer<Tasklist>) => {
      Observable.fromPromise(TasklistFetch.update(_tasklistId, patch))
        .concatMap(tasklist => TasklistModel.update<Tasklist>(_tasklistId, tasklist))
        .forEach(tasklist => observer.next(tasklist))
        .then(x => observer.complete())
    })
  }

  delete(_tasklistId: string): Observable<void> {
    return Observable.create((observer: Observer<void>) => {
      Observable.fromPromise(TasklistFetch.delete(_tasklistId))
        .concatMap(x => TasklistModel.delete(_tasklistId))
        .forEach(x => observer.next(null))
        .then(x => observer.complete())
    })
  }

  archive(_tasklistId: string): Observable<Tasklist> {
    return Observable.create((observer: Observer<Tasklist>) => {
      Observable.fromPromise(TasklistFetch.archive(_tasklistId))
        .concatMap(tasklist => TasklistModel.update<Tasklist>(_tasklistId, tasklist))
        .forEach(tasklist => observer.next(tasklist))
        .then(x => observer.complete())
    })
  }

  unArchive(_tasklistId: string): Observable<Tasklist> {
    return Observable.create((observer: Observer<Tasklist>) => {
      return Observable.fromPromise(TasklistFetch.unarchive(_tasklistId))
        .concatMap(tasklist => TasklistModel.update<Tasklist>(_tasklistId, tasklist))
        .forEach(x => observer.next(x))
        .then(x => observer.complete())
    })
  }

  updateStageIds(_tasklistId: string, stagesIds: string[]): Observable<string[]> {
    return Observable.create((observer: Observer<string[]>) => {
      let _ids: string[]
      Observable.fromPromise(TasklistFetch.updateStageIds(_tasklistId, stagesIds))
        .concatMap(ids => {
          _ids = ids
          return StageModel.updateOrders(_tasklistId, ids)
        })
        .forEach(x => observer.next(_ids))
        .then(x => observer.complete())
    })
  }

}
