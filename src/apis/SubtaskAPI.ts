'use strict'
import { Observable, Observer } from 'rxjs'
import SubtaskModel from '../models/SubtaskModel'
import TaskModel from '../models/TaskModel'
import { SubtaskFetch, SubtaskUpdateOptions } from '../fetchs/SubtaskFetch'
import Subtask from '../schemas/Subtask'
import Task from '../schemas/Task'
import { makeColdSignal, errorHandler } from './utils'
import { OrganizationData } from '../teambition'

const subtaskFetch = new SubtaskFetch()

export class SubtaskAPI {

  constructor() {
    SubtaskModel.destructor()
    TaskModel.destructor()
  }

  getFromTask(_taskId: string): Observable<Subtask[]> {
    const get = SubtaskModel.getFromTask(_taskId)
    if (get) {
      return get
    }
    return makeColdSignal(observer => {
      return Observable.fromPromise(subtaskFetch.getFromTask(_taskId))
        .catch(err => errorHandler(observer, err))
        .concatMap(subtasks => SubtaskModel.addToTask(_taskId, subtasks))
    })
  }

  get(_subtaskid: string, _taskId?: string, withExecutor?: boolean): Observable<Subtask> {
    const get = SubtaskModel.get(_subtaskid)
    if (get) {
      return get
    }
    return makeColdSignal(observer => {
      return Observable.fromPromise(subtaskFetch.get(_subtaskid, _taskId, withExecutor))
        .catch(err => errorHandler(observer, err))
        .concatMap(subtask => SubtaskModel.add(subtask))
    })
  }

  create(subtaskData: {
    content: string
    _taskId: string
    _executorId?: string
  }): Observable<Subtask> {
    return Observable.create((observer: Observer<Subtask>) => {
      Observable.fromPromise(subtaskFetch.create(subtaskData))
        .catch(err => {
          observer.error(err)
          return Observable.of(null)
        })
        .concatMap(subtask => SubtaskModel.add(subtask))
        .forEach(subtask => observer.next(subtask))
    })
  }

  update(_subtaskId: string, options: SubtaskUpdateOptions): Observable<Subtask> {
    return Observable.create((observer: Observer<Subtask>) => {
      Observable.fromPromise(subtaskFetch.update(_subtaskId, options))
        .catch(err => {
          observer.error(err)
          return Observable.of(null)
        })
        .concatMap(subtask => SubtaskModel.update<Subtask>(_subtaskId, subtask))
        .forEach(x => observer.next(x))
    })
  }

  delete(_subtaskid: string): Observable<void> {
    return Observable.create((observer: Observer<void>) => {
      Observable.fromPromise(subtaskFetch.delete(_subtaskid))
        .catch(err => {
          observer.error(err)
          return Observable.of(null)
        })
        .concatMap(x => SubtaskModel.delete(_subtaskid))
        .forEach(x => observer.next(null))
    })
  }

  transform(_subtaskId: string, doLink = false, doLinked = false): Observable<Task> {
    return Observable.create((observer: Observer<Task>) => {
      let task: Task
      Observable.fromPromise(subtaskFetch.transform(_subtaskId, doLink, doLinked))
        .catch(err => {
          observer.next(err)
          return Observable.of(null)
        })
        .concatMap(task => {
          task = task
          return TaskModel.add(task)
        })
        .concatMap(x => SubtaskModel.delete(_subtaskId))
        .forEach(x => observer.next(task))
    })
  }

  updateContent(_subtaskId: string, content: string): Observable<Subtask> {
    return Observable.create((observer: Observer<Subtask>) => {
      this._updateFromPromise(_subtaskId, observer, subtaskFetch.updateContent(_subtaskId, content))
    })
  }

  updateDuedate(_subTaskId: string, dueDate: string): Observable<Subtask> {
    return Observable.create((observer: Observer<Subtask>) => {
      this._updateFromPromise(_subTaskId, observer, subtaskFetch.updateDuedate(_subTaskId, dueDate))
    })
  }

  updateExecutor(_subTaskId: string, _executorId: string): Observable<Subtask> {
    return Observable.create((observer: Observer<Subtask>) => {
      this._updateFromPromise(_subTaskId, observer, subtaskFetch.updateExecutor(_subTaskId, _executorId))
    })
  }

  updateStatus(_subTaskId: string, isDone: boolean): Observable<Subtask> {
    return Observable.create((observer: Observer<Subtask>) => {
      this._updateFromPromise(_subTaskId, observer, subtaskFetch.updateStatus(_subTaskId, isDone))
    })
  }

  getOrganizationMySubtasks(userId: string, organization: OrganizationData, page = 1): Observable<Subtask[]> {
    const get = SubtaskModel.getOrganizationMySubtasks(page)
    if (get) {
      return get
    }
    return makeColdSignal(observer => {
      return Observable.fromPromise(subtaskFetch.getOrgsSubtasksMe(organization._id, {
        page: page,
        isDone: false,
        hasDuedate: false
      }))
        .catch(err => errorHandler(observer, err))
        .concatMap(subtasks => SubtaskModel.addOrganizationMySubtasks(userId, organization, subtasks, page))
    })
  }

  getOrganizationMyDueSubtasks(userId: string, organization: OrganizationData, page = 1): Observable<Subtask[]> {
    const get = SubtaskModel.getOrganizationMyDueSubtasks(page)
    if (get) {
      return get
    }
    return makeColdSignal(observer => {
      return Observable.fromPromise(subtaskFetch.getOrgsSubtasksMe(organization._id, {
        page: page,
        isDone: false,
        hasDuedate: true
      }))
        .catch(err => errorHandler(observer, err))
        .concatMap(subtasks => SubtaskModel.addOrganizationMyDueSubtasks(userId, organization, subtasks, page))
    })
  }

  getOrganizationMyDoneSubtasks(userId: string, organization: OrganizationData, page = 1): Observable<Subtask[]> {
    const get = SubtaskModel.getOrganizationMyDoneSubtasks(page)
    if (get) {
      return get
    }
    return makeColdSignal(observer => {
      return Observable.fromPromise(subtaskFetch.getOrgsSubtasksMe(organization._id, {
        page: page,
        isDone: true
      }))
        .catch(err => errorHandler(observer, err))
        .concatMap(subtasks => SubtaskModel.addOrganizationMyDoneSubtasks(userId, organization, subtasks, page))
    })
  }

  private _updateFromPromise(_subtaskId: string, observer: Observer<Subtask>, promise: Promise<any>) {
    Observable.fromPromise(promise)
      .catch(err => {
        observer.error(err)
        return SubtaskModel.get(_subtaskId)
      })
      .concatMap(subtask => SubtaskModel.update<Subtask>(_subtaskId, subtask))
      .forEach(subtask => observer.next(subtask))
  }
}
