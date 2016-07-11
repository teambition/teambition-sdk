'use strict'
import { Observable } from 'rxjs/Observable'
import { Observer } from 'rxjs/Observer'
import SubtaskModel from '../models/SubtaskModel'
import TaskModel from '../models/TaskModel'
import { default as SubtaskFetch, SubtaskUpdateOptions } from '../fetchs/SubtaskFetch'
import { SubtaskData } from '../schemas/Subtask'
import Task from '../schemas/Task'
import { makeColdSignal, errorHandler, observableError } from './utils'
import { OrganizationData } from '../schemas/Organization'

export class SubtaskAPI {

  constructor() {
    SubtaskModel.destructor()
  }

  getFromTask(_taskId: string): Observable<SubtaskData[]> {
    return makeColdSignal<SubtaskData[]>(observer => {
      const get = SubtaskModel.getFromTask(_taskId)
      if (get) {
        return get
      }
      return Observable.fromPromise(SubtaskFetch.getFromTask(_taskId))
        .catch(err => errorHandler(observer, err))
        .concatMap(subtasks => SubtaskModel.addToTask(_taskId, subtasks))
    })
  }

  get(_subtaskid: string, _taskId?: string, withExecutor?: boolean): Observable<SubtaskData> {
    return makeColdSignal<SubtaskData>(observer => {
      const get = SubtaskModel.getOne(_subtaskid)
      if (get && SubtaskModel.checkSchema(_subtaskid)) {
        return get
      }
      return Observable.fromPromise(SubtaskFetch.getOne(_subtaskid, _taskId, withExecutor))
        .catch(err => errorHandler(observer, err))
        .concatMap(subtask => SubtaskModel.addOne(subtask))
    })
  }

  create(subtaskData: {
    content: string
    _taskId: string
    _executorId?: string
  }): Observable<SubtaskData> {
    return Observable.create((observer: Observer<SubtaskData>) => {
      Observable.fromPromise(SubtaskFetch.create(subtaskData))
        .catch(err => {
          observer.error(err)
          return Observable.of(null)
        })
        .concatMap(subtask => SubtaskModel.addOne(subtask))
        .forEach(subtask => observer.next(subtask))
        .then(x => observer.complete())
    })
  }

  update(_subtaskId: string, options: SubtaskUpdateOptions): Observable<SubtaskUpdateOptions> {
    return Observable.create((observer: Observer<SubtaskUpdateOptions>) => {
      Observable.fromPromise(SubtaskFetch.update(_subtaskId, options))
        .catch(err => observableError(observer, err))
        .concatMap(subtask => SubtaskModel.update(_subtaskId, subtask))
        .forEach(x => observer.next(x))
        .then(x => observer.complete())
    })
  }

  delete(_subtaskid: string): Observable<void> {
    return Observable.create((observer: Observer<void>) => {
      Observable.fromPromise(SubtaskFetch.delete(_subtaskid))
        .catch(err => {
          observer.error(err)
          return Observable.of(null)
        })
        .concatMap(x => SubtaskModel.delete(_subtaskid))
        .forEach(x => observer.next(null))
        .then(x => observer.complete())
    })
  }

  transform(_subtaskId: string, doLink = false, doLinked = false): Observable<Task> {
    return Observable.create((observer: Observer<Task>) => {
      let _task: Task
      Observable.fromPromise(SubtaskFetch.transform(_subtaskId, doLink, doLinked))
        .catch(err => observableError(observer, err))
        .concatMap(task => {
          _task = task
          return TaskModel.addOne(task).take(1)
        })
        .concatMap(x => SubtaskModel.delete(_subtaskId))
        .forEach(x => observer.next(_task))
        .then(x => observer.complete())
    })
  }

  updateContent(_subtaskId: string, content: string): Observable<SubtaskData> {
    return Observable.create((observer: Observer<SubtaskData>) => {
      this._updateFromPromise(_subtaskId, observer, SubtaskFetch.updateContent(_subtaskId, content))
    })
  }

  updateDuedate(_subTaskId: string, dueDate: string): Observable<SubtaskData> {
    return Observable.create((observer: Observer<SubtaskData>) => {
      this._updateFromPromise(_subTaskId, observer, SubtaskFetch.updateDuedate(_subTaskId, dueDate))
    })
  }

  updateExecutor(_subTaskId: string, _executorId: string): Observable<SubtaskData> {
    return Observable.create((observer: Observer<SubtaskData>) => {
      this._updateFromPromise(_subTaskId, observer, SubtaskFetch.updateExecutor(_subTaskId, _executorId))
    })
  }

  updateStatus(_subTaskId: string, isDone: boolean): Observable<SubtaskData> {
    return Observable.create((observer: Observer<SubtaskData>) => {
      this._updateFromPromise(_subTaskId, observer, SubtaskFetch.updateStatus(_subTaskId, isDone))
    })
  }

  getOrgMySubtasks(userId: string, organization: OrganizationData, page = 1): Observable<SubtaskData[]> {
    return makeColdSignal<SubtaskData[]>(observer => {
      const get = SubtaskModel.getOrgMySubtasks(organization._id, page)
      if (get) {
        return get
      }
      return Observable.fromPromise(SubtaskFetch.getOrgsSubtasksMe(organization._id, {
        page: page,
        isDone: false,
        hasDuedate: false
      }))
        .catch(err => errorHandler(observer, err))
        .concatMap(subtasks => SubtaskModel.addOrgMySubtasks(userId, organization, subtasks, page))
    })
  }

  getOrgMyDueSubtasks(userId: string, organization: OrganizationData, page = 1): Observable<SubtaskData[]> {
    return makeColdSignal<SubtaskData[]>(observer => {
      const get = SubtaskModel.getOrgMyDueSubtasks(organization._id, page)
      if (get) {
        return get
      }
      return Observable.fromPromise(SubtaskFetch.getOrgsSubtasksMe(organization._id, {
        page: page,
        isDone: false,
        hasDuedate: true
      }))
        .catch(err => errorHandler(observer, err))
        .concatMap(subtasks => SubtaskModel.addOrgMyDueSubtasks(userId, organization, subtasks, page))
    })
  }

  getOrgMyDoneSubtasks(userId: string, organization: OrganizationData, page = 1): Observable<SubtaskData[]> {
    return makeColdSignal<SubtaskData[]>(observer => {
      const get = SubtaskModel.getOrgMyDoneSubtasks(organization._id, page)
      if (get) {
        return get
      }
      return Observable.fromPromise(SubtaskFetch.getOrgsSubtasksMe(organization._id, {
        page: page,
        isDone: true
      }))
        .catch(err => errorHandler(observer, err))
        .concatMap(subtasks => SubtaskModel.addOrgMyDoneSubtasks(userId, organization, subtasks, page))
    })
  }

  getOrgMyCreatedSubtasks(userId: string, organization: OrganizationData, page = 1): Observable<SubtaskData[]> {
    return makeColdSignal<SubtaskData[]>(observer => {
      const get = SubtaskModel.getOrgMyCreatedSubtasks(organization._id, page)
      if (get) {
        return get
      }
      const maxId = SubtaskModel.getOrgMyCreatedMaxId(organization._id)
      return Observable.fromPromise(SubtaskFetch.getOrgsSubtasksCreated(organization._id, page, maxId))
        .catch(err => errorHandler(observer, err))
        .concatMap(subtasks => SubtaskModel.addOrgMyCreatedSubtasks(userId, organization, subtasks, page))
    })
  }

  private _updateFromPromise(_subtaskId: string, observer: Observer<SubtaskData>, promise: Promise<any>) {
    let result: SubtaskData
    Observable.fromPromise(promise)
      .catch(err => observableError(observer, err))
      .concatMap(subtask => {
        result = subtask
        return SubtaskModel.update<SubtaskData>(_subtaskId, subtask)
      })
      .forEach(subtask => {
        observer.next(result)
        observer.complete()
      })
  }
}
