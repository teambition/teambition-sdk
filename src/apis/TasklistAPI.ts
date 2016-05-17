'use strict'
import {Observable, Observer} from 'rxjs'
import {TasklistFetch, UpdateTasklistOptions} from '../fetchs/TasklistFetch'
import TasklistModel from '../models/TasklistModel'
import StageModel from '../models/StageModel'
import Tasklist from '../schemas/Tasklist'

const tasklistFetch = new TasklistFetch()

export class TasklistAPI {

  getTasklists(_projectId: string, query?: any): Observable<Tasklist[]> {
    const get = TasklistModel.getTasklists(_projectId)
    if (get) {
      return get
    }
    return Observable.fromPromise(tasklistFetch.getTasklists(_projectId, query))
      .concatMap(tasklists => TasklistModel.addTasklists(_projectId, tasklists))
  }

  getOne(_tasklistId: string, query?: any): Observable<Tasklist> {
    const get = TasklistModel.get(_tasklistId)
    if (get) {
      return get
    }
    return Observable.fromPromise(tasklistFetch.get(_tasklistId, query))
      .concatMap(tasklist => TasklistModel.add(tasklist))
  }

  update(_tasklistId: string, patch: UpdateTasklistOptions): Observable<Tasklist> {
    return Observable.create((observer: Observer<Tasklist>) => {
      Observable.fromPromise(tasklistFetch.update(_tasklistId, patch))
        .concatMap(tasklist => TasklistModel.update<Tasklist>(_tasklistId, tasklist))
        .forEach(tasklist => observer.next(tasklist))
    })
  }

  delete(_tasklistId: string): Observable<void> {
    return Observable.create((observer: Observer<void>) => {
      Observable.fromPromise(tasklistFetch.delete(_tasklistId))
        .concatMap(x => TasklistModel.delete(_tasklistId))
        .forEach(x => observer.next(null))
    })
  }

  archive(_tasklistId: string): Observable<Tasklist> {
    return Observable.create((observer: Observer<Tasklist>) => {
      Observable.fromPromise(tasklistFetch.archive(_tasklistId))
        .concatMap(tasklist => TasklistModel.update<Tasklist>(_tasklistId, tasklist))
        .forEach(tasklist => observer.next(tasklist))
    })
  }

  unArchive(_tasklistId: string): Observable<Tasklist> {
    return Observable.create((observer: Observer<Tasklist>) => {
      return Observable.fromPromise(tasklistFetch.unarchive(_tasklistId))
        .concatMap(tasklist => TasklistModel.update<Tasklist>(_tasklistId, tasklist))
        .forEach(x => observer.next(x))
    })
  }

  updateStageIds(_tasklistId: string, stagesIds: string[]): Observable<string[]> {
    return Observable.create((observer: Observer<string[]>) => {
      let _ids: string[]
      Observable.fromPromise(tasklistFetch.updateStageIds(_tasklistId, stagesIds))
        .concatMap(ids => {
          _ids = ids
          return StageModel.updateOrders(_tasklistId, ids)
        })
        .forEach(x => observer.next(_ids))
    })
  }

}
