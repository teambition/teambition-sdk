'use strict'
import { Observable, Observer } from 'rxjs'
import TaskModel from '../models/TaskModel'
import Task from '../schemas/Task'
import { errorHandler, makeColdSignal } from './utils'
import {
  TaskFetch,
  CreateTaskOptions,
  MoveTaskOptions,
  UpdateTaskOptions
} from '../fetchs/TaskFetch'
import { OrganizationData } from '../teambition'

const taskFetch = new TaskFetch()

export type detailType = 'complete'

export class TaskAPI {

  constructor() {
    TaskModel.$destroy()
  }

  getTasklistUndone(_tasklistId: string): Observable<Task[]> {
    const get = TaskModel.getTasklistTasksUndone(_tasklistId)
    if (get) {
      return get
    }
    return makeColdSignal(observer => {
      return Observable.fromPromise(taskFetch.getByTasklist(_tasklistId, {
        isDone: false
      }))
        .catch(err => errorHandler(observer, err))
        .concatMap(tasks => TaskModel.addTasklistTasksUndone(_tasklistId, tasks))
    })
  }

  getTasklistDone(_tasklistId: string, page = 1): Observable<Task[]> {
    const get = TaskModel.getTasklistTasksDone(_tasklistId, page)
    if (get) {
      return get
    }
    return makeColdSignal(observer => {
      return Observable.fromPromise(taskFetch.getByTasklist(_tasklistId, {
        isDone: true,
        page: page,
        limit: 30
      }))
        .catch(err => errorHandler(observer, err))
        .concatMap(tasks => TaskModel.addTasklistTasksDone(_tasklistId, tasks, page))
    })
  }

  getOrganizationMyDueTasks(organization: OrganizationData, page = 1): Observable<Task[]> {
    const get = TaskModel.getOrganizationMyDueTasks(organization._id, page)
    if (get) {
      return get
    }
    return makeColdSignal(observer => {
      return Observable.fromPromise(taskFetch.getOrgsTasksMe(organization._id, {
        page: page,
        isDone: false,
        hasDuedate: true
      }))
        .catch(err => errorHandler(observer, err))
        .concatMap(tasks => TaskModel.addOrganizationMyDueTasks(organization, tasks, page))
    })
  }

  getOrganizationMyTasks(organization: OrganizationData, page = 1): Observable<Task[]> {
    const get = TaskModel.getOrganizationMyTasks(organization._id, page)
    if (get) {
      return get
    }
    return makeColdSignal(observer => {
      return Observable.fromPromise(taskFetch.getOrgsTasksMe(organization._id, {
        page: page,
        isDone: false,
        hasDuedate: false
      }))
        .catch(err => errorHandler(observer, err))
        .concatMap(tasks => TaskModel.addOrganizationMyTasks(organization, tasks, page))
    })
  }

  getOrganizationMyDoneTasks(organization: OrganizationData, page = 1): Observable<Task[]> {
    const get = TaskModel.getOrganizationMyDoneTasks(organization._id, page)
    if (get) {
      return get
    }
    return makeColdSignal(observer => {
      return Observable.fromPromise(taskFetch.getOrgsTasksMe(organization._id, {
        page: page,
        isDone: true
      }))
        .catch(err => errorHandler(observer, err))
        .concatMap(tasks => TaskModel.addOrganizationMyDoneTasks(organization, tasks, page))
    })
  }

  get(_id: string, detailType?: detailType): Observable<Task> {
    const get = TaskModel.get(_id)
    if (get) {
      return get
    }
    return makeColdSignal(observer => {
      return Observable.fromPromise(taskFetch.get(_id, detailType))
        .catch(err => errorHandler(observer, err))
        .concatMap(task => TaskModel.add(task))
    })
  }

  create(taskInfo: CreateTaskOptions): Observable<Task> {
    return Observable.create((observer: Observer<Task>) => {
      Observable.fromPromise(taskFetch.create(taskInfo))
        .catch(err => {
          observer.error(err)
          return Observable.of(null)
        })
        .concatMap(task => TaskModel.add(task))
        .forEach(task => observer.next(task))
    })
  }

  delete(_taskId: string): Observable<void> {
    return Observable.create((observer: Observer<void>) => {
      Observable.fromPromise(taskFetch.delete(_taskId))
        .catch(err => {
          observer.error(err)
          return TaskModel.get(_taskId)
        })
        .concatMap(x => TaskModel.delete(_taskId))
        .forEach(x => observer.next(null))
    })
  }

  move(_taskId: string, options: MoveTaskOptions): Observable<Task> {
    return Observable.create((observer: Observer<Task>) => {
      const promise = taskFetch.move(_taskId, options)
      this._updateFromPromise(_taskId, observer, promise)
    })
  }

  updateContent(_taskId: string, content: string): Observable<Task> {
    return Observable.create((observer: Observer<Task>) => {
      const promise = taskFetch.updateContent(_taskId, content)
      this._updateFromPromise(_taskId, observer, promise)
    })
  }

  updateDueDate(_taskId: string, dueDate: string): Observable<Task> {
    return Observable.create((observer: Observer<Task>) => {
      const promise = taskFetch.updateDueDate(_taskId, dueDate)
      this._updateFromPromise(_taskId, observer, promise)
    })
  }

  updateExecutor(_taskId: string, _executorId: string): Observable<Task> {
    return Observable.create((observer: Observer<Task>) => {
      const promise = taskFetch.updateExecutor(_taskId, _executorId)
      this._updateFromPromise(_taskId, observer, promise)
    })
  }

  updateInvolvemembers(_taskId: string, memberIds: string[], type: 'involveMembers' | 'addInvolvers' | 'delInvolvers'): Observable<Task> {
    return Observable.create((observer: Observer<Task>) => {
      const promise = taskFetch.updateInvolvemembers(_taskId, memberIds, type)
      this._updateFromPromise(_taskId, observer, promise)
    })
  }

  updateNote(_taskId: string, note: string): Observable<Task> {
    return Observable.create((observer: Observer<Task>) => {
      const promise = taskFetch.updateNote(_taskId, note)
      this._updateFromPromise(_taskId, observer, promise)
    })
  }

  updateStatus(_taskId: string, status: boolean): Observable<Task> {
    return Observable.create((observer: Observer<Task>) => {
      const promise = taskFetch.updateStatus(_taskId, status)
      this._updateFromPromise(_taskId, observer, promise)
    })
  }

  update<T extends UpdateTaskOptions>(_taskId: string, patch: T): Observable<Task> {
    return Observable.create((observer: Observer<Task>) => {
      const promise = taskFetch.update(_taskId, patch)
      this._updateFromPromise(_taskId, observer, promise)
    })
  }

  private _updateFromPromise(_taskId: string, observer: Observer<Task>, promise: Promise<any>) {
    Observable.fromPromise(promise)
      .catch(err => {
        observer.error(err)
        return TaskModel.get(_taskId)
      })
      .concatMap(task => TaskModel.update<Task>(_taskId, task))
      .forEach(task => observer.next(task))
  }
}
