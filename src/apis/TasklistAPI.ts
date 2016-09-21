'use strict'
import { Observable } from 'rxjs/Observable'
import { Observer } from 'rxjs/Observer'
import TasklistFetch, {
  CreateTasklistOptions,
  UpdateTasklistOptions,
  ArchiveTasklistResponse,
  UnarchiveTasklistResponse
} from '../fetchs/TasklistFetch'
import TasklistModel from '../models/TasklistModel'
import { TasklistData } from '../schemas/Tasklist'
import { errorHandler, makeColdSignal, observableError } from './utils'

export class TasklistAPI {

  create(option: CreateTasklistOptions): Observable<TasklistData> {
    return Observable.create((observer: Observer<TasklistData>) => {
      Observable.fromPromise(TasklistFetch.create(option))
        .catch(err => observableError(observer, err))
        .concatMap(r => TasklistModel.addOne(r).take(1))
        .forEach(r => observer.next(r))
        .then(() => observer.complete())
    })
  }

  getTasklists(_projectId: string, query?: any): Observable<TasklistData[]> {
    return makeColdSignal<TasklistData[]>(observer => {
      const get = TasklistModel.getTasklists(_projectId)
      if (get) {
        return get
      }
      return Observable.fromPromise(TasklistFetch.getTasklists(_projectId, query))
        .catch(err => errorHandler(observer, err))
        .concatMap(tasklists => TasklistModel.addTasklists(_projectId, tasklists))
    })
  }

  getOne(_tasklistId: string, query?: any): Observable<TasklistData> {
    return makeColdSignal<TasklistData>(observer => {
      const get = TasklistModel.getOne(_tasklistId)
      if (get && TasklistModel.checkSchema(_tasklistId)) {
        return get
      }
      return Observable.fromPromise(TasklistFetch.get(_tasklistId, query))
        .catch(err => errorHandler(observer, err))
        .concatMap(tasklist => TasklistModel.addOne(tasklist))
    })
  }

  update(_tasklistId: string, patch: UpdateTasklistOptions): Observable<UpdateTasklistOptions> {
    return Observable.create((observer: Observer<UpdateTasklistOptions>) => {
      Observable.fromPromise(TasklistFetch.update(_tasklistId, patch))
        .concatMap(tasklist => TasklistModel.update(_tasklistId, tasklist))
        .forEach(tasklist => observer.next(tasklist))
        .then(() => observer.complete())
    })
  }

  delete(_tasklistId: string): Observable<void> {
    return Observable.create((observer: Observer<void>) => {
      Observable.fromPromise(TasklistFetch.delete(_tasklistId))
        .concatMap(x => TasklistModel.delete(_tasklistId))
        .forEach(x => observer.next(null))
        .then(() => observer.complete())
    })
  }

  archive(_tasklistId: string): Observable<ArchiveTasklistResponse> {
    return Observable.create((observer: Observer<ArchiveTasklistResponse>) => {
      Observable.fromPromise(TasklistFetch.archive(_tasklistId))
        .concatMap(tasklist => TasklistModel.update(_tasklistId, tasklist))
        .forEach(tasklist => observer.next(tasklist))
        .then(() => observer.complete())
    })
  }

  unArchive(_tasklistId: string): Observable<UnarchiveTasklistResponse> {
    return Observable.create((observer: Observer<UnarchiveTasklistResponse>) => {
      return Observable.fromPromise(TasklistFetch.unarchive(_tasklistId))
        .concatMap(x => TasklistModel.update(_tasklistId, x))
        .forEach(x => observer.next(x))
        .then(() => observer.complete())
    })
  }

}
