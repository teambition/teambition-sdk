'use strict'
import { Observable } from 'rxjs/Observable'
import { Observer } from 'rxjs/Observer'
import TaskModel from '../models/TaskModel'
import { TaskData } from '../schemas/Task'
import { errorHandler, makeColdSignal, observableError } from './utils'
import {
  default as TaskFetch,
  CreateTaskOptions,
  MoveTaskOptions,
  UpdateTaskOptions,
  ForkTaskOptions
} from '../fetchs/TaskFetch'
import { OrganizationData } from '../schemas/Organization'

export type detailType = 'complete'

export class TaskAPI {

  constructor() {
    TaskModel.destructor()
  }

  getTasklistUndone(_tasklistId: string): Observable<TaskData[]> {
    return makeColdSignal<TaskData[]>(observer => {
      const get = TaskModel.getTasklistTasksUndone(_tasklistId)
      if (get) {
        return get
      }
      return Observable.fromPromise(TaskFetch.getByTasklist(_tasklistId, {
        isDone: false
      }))
        .catch(err => errorHandler(observer, err))
        .concatMap(tasks => TaskModel.addTasklistTasksUndone(_tasklistId, tasks))
    })
  }

  getTasklistDone(_tasklistId: string, page = 1): Observable<TaskData[]> {
    return makeColdSignal<TaskData[]>(observer => {
      const get = TaskModel.getTasklistTasksDone(_tasklistId, page)
      if (get) {
        return get
      }
      return Observable.fromPromise(TaskFetch.getByTasklist(_tasklistId, {
        isDone: true,
        page: page,
        limit: 30
      }))
        .catch(err => errorHandler(observer, err))
        .concatMap(tasks => TaskModel.addTasklistTasksDone(_tasklistId, tasks, page))
    })
  }

  getOrgMyDueTasks(userId: string, organization: OrganizationData, page = 1): Observable<TaskData[]> {
    return makeColdSignal<TaskData[]>(observer => {
      const get = TaskModel.getOrganizationMyDueTasks(organization._id, page)
      if (get) {
        return get
      }
      return Observable.fromPromise(TaskFetch.getOrgsTasksMe(organization._id, {
        page: page,
        isDone: false,
        hasDuedate: true
      }))
        .catch(err => errorHandler(observer, err))
        .concatMap(tasks => TaskModel.addOrganizationMyDueTasks(userId, organization, tasks, page))
    })
  }

  getOrgMyTasks(userId: string, organization: OrganizationData, page = 1): Observable<TaskData[]> {
    return makeColdSignal<TaskData[]>(observer => {
      const get = TaskModel.getOrganizationMyTasks(organization._id, page)
      if (get) {
        return get
      }
      return Observable.fromPromise(TaskFetch.getOrgsTasksMe(organization._id, {
        page: page,
        isDone: false,
        hasDuedate: false
      }))
        .catch(err => errorHandler(observer, err))
        .concatMap(tasks => TaskModel.addOrganizationMyTasks(userId, organization, tasks, page))
    })
  }

  getOrgMyDoneTasks(userId: string, organization: OrganizationData, page = 1): Observable<TaskData[]> {
    return makeColdSignal<TaskData[]>(observer => {
      const get = TaskModel.getOrganizationMyDoneTasks(organization._id, page)
      if (get) {
        return get
      }
      return Observable.fromPromise(TaskFetch.getOrgsTasksMe(organization._id, {
        page: page,
        isDone: true
      }))
        .catch(err => errorHandler(observer, err))
        .concatMap(tasks => TaskModel.addOrganizationMyDoneTasks(userId, organization, tasks, page))
    })
  }

  getOrgMyCreatedTasks(userId: string, organization: OrganizationData, page = 1): Observable<TaskData[]> {
    return makeColdSignal<TaskData[]>(observer => {
      const get = TaskModel.getOrganizationMyCreatedTasks(organization._id, page)
      if (get) {
        return get
      }
      const maxId = TaskModel.getOrgMyCreatedMaxId(organization._id)
      return Observable.fromPromise(TaskFetch.getOrgsTasksCreated(organization._id, page, maxId))
        .catch(err => errorHandler(observer, err))
        .concatMap(tasks => TaskModel.addOrganizationMyCreatedTasks(userId, organization, tasks, page))
    })
  }

  getOrgMyInvolvesTasks(userId: string, organization: OrganizationData, page = 1): Observable<TaskData[]> {
    return makeColdSignal<TaskData[]>(observer => {
      const get = TaskModel.getOrgInvolvesTasks(organization._id, page)
      if (get) {
        return get
      }
      const maxId = TaskModel.getOrgMyInvolvesMaxId(organization._id)
      return Observable.fromPromise(TaskFetch.getOrgsTasksInvolves(organization._id, page, maxId))
        .catch(err => errorHandler(observer, err))
        .concatMap(tasks => TaskModel.addOrgMyInvolvesTasks(userId, organization, tasks, page))
    })
  }

  getProjectTasks(_projectId: string, query?: {
    page?: number
    count?: number
    fileds?: string
  }): Observable<TaskData[]> {
    return makeColdSignal<TaskData[]>(observer => {
      const page = query && query.page ? query.page : 1
      const get = TaskModel.getProjectTasks(_projectId, page)
      if (get) {
        return get
      }
      return Observable.fromPromise(TaskFetch.getProjectTasks(_projectId, query))
        .catch(err => errorHandler(observer, err))
        .concatMap(tasks => TaskModel.addProjectTasks(_projectId, tasks, page))
    })
  }

  getProjectDoneTasks(_projectId: string, query?: {
    page?: number
    count?: number
    fileds?: string
  }): Observable<TaskData[]> {
    return makeColdSignal<TaskData[]>(observer => {
      const page = query && query.page ? query.page : 1
      const get = TaskModel.getProjectDoneTasks(_projectId, page)
      if (get) {
        return get
      }
      return Observable.fromPromise(TaskFetch.getProjectDoneTasks(_projectId, query))
        .catch(err => errorHandler(observer, err))
        .concatMap(tasks => TaskModel.addProjectDoneTasks(_projectId, tasks, page))
    })
  }

  get(_id: string, detailType?: detailType): Observable<TaskData> {
    return makeColdSignal<TaskData>(observer => {
      const get = TaskModel.getOne(_id)
      if (get && TaskModel.checkSchema(_id)) {
        return get
      }
      return Observable.fromPromise(TaskFetch.get(_id, detailType))
        .catch(err => errorHandler(observer, err))
        .concatMap(task => TaskModel.addOne(task))
    })
  }

  create(taskInfo: CreateTaskOptions): Observable<TaskData> {
    return Observable.create((observer: Observer<TaskData>) => {
      Observable.fromPromise(TaskFetch.create(taskInfo))
        .catch(err => {
          observer.error(err)
          return Observable.of(null)
        })
        .concatMap(task => TaskModel.addOne(task))
        .forEach(task => observer.next(task))
        .then(x => observer.complete())
    })
  }

  fork(_taskId: string, options: ForkTaskOptions): Observable<TaskData> {
    return Observable.create((observer: Observer<TaskData>) => {
      Observable.fromPromise(TaskFetch.fork(_taskId, options))
        .catch(err => {
          observer.error(err)
          return Observable.of(null)
        })
        .concatMap(task => TaskModel.addOne(task))
        .forEach(task => observer.next(task))
        .then(x => observer.complete())
    })
  }

  delete(_taskId: string): Observable<void> {
    return Observable.create((observer: Observer<void>) => {
      Observable.fromPromise(TaskFetch.delete(_taskId))
        .catch(err => {
          observer.error(err)
          return TaskModel.getOne(_taskId)
        })
        .concatMap(x => TaskModel.delete(_taskId))
        .forEach(x => observer.next(null))
        .then(x => observer.complete())
    })
  }

  move(_taskId: string, options: MoveTaskOptions): Observable<TaskData> {
    return Observable.create((observer: Observer<TaskData>) => {
      const promise = TaskFetch.move(_taskId, options)
      this._updateFromPromise(_taskId, observer, promise)
    })
  }

  updateContent(_taskId: string, content: string): Observable<TaskData> {
    return Observable.create((observer: Observer<TaskData>) => {
      const promise = TaskFetch.updateContent(_taskId, content)
      this._updateFromPromise(_taskId, observer, promise)
    })
  }

  updateDueDate(_taskId: string, dueDate: string): Observable<TaskData> {
    return Observable.create((observer: Observer<TaskData>) => {
      const promise = TaskFetch.updateDueDate(_taskId, dueDate)
      this._updateFromPromise(_taskId, observer, promise)
    })
  }

  updateExecutor(_taskId: string, _executorId: string): Observable<TaskData> {
    return Observable.create((observer: Observer<TaskData>) => {
      const promise = TaskFetch.updateExecutor(_taskId, _executorId)
      this._updateFromPromise(_taskId, observer, promise)
    })
  }

  updateInvolvemembers(_taskId: string, memberIds: string[], type: 'involveMembers' | 'addInvolvers' | 'delInvolvers'): Observable<TaskData> {
    return Observable.create((observer: Observer<TaskData>) => {
      const promise = TaskFetch.updateInvolvemembers(_taskId, memberIds, type)
      this._updateFromPromise(_taskId, observer, promise)
    })
  }

  updateNote(_taskId: string, note: string): Observable<TaskData> {
    return Observable.create((observer: Observer<TaskData>) => {
      const promise = TaskFetch.updateNote(_taskId, note)
      this._updateFromPromise(_taskId, observer, promise)
    })
  }

  updateStatus(_taskId: string, status: boolean): Observable<TaskData> {
    return Observable.create((observer: Observer<TaskData>) => {
      const promise = TaskFetch.updateStatus(_taskId, status)
      this._updateFromPromise(_taskId, observer, promise)
    })
  }

  update<T extends UpdateTaskOptions>(_taskId: string, patch: T): Observable<TaskData> {
    return Observable.create((observer: Observer<TaskData>) => {
      const promise = TaskFetch.update(_taskId, patch)
      this._updateFromPromise(_taskId, observer, promise)
    })
  }

  private _updateFromPromise(_taskId: string, observer: Observer<TaskData>, promise: Promise<any>) {
    let result: TaskData
    return Observable.fromPromise(promise)
      .catch(err => observableError(observer, err))
      .concatMap(task => {
        result = task
        return TaskModel.update(_taskId, task)
      })
      .forEach(task => {
        observer.next(result)
        observer.complete()
      })
  }
}
