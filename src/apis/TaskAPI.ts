'use strict'
import { Observable, Observer } from 'rxjs'
import TaskModel from '../models/TaskModel'
import Task from '../schemas/Task'
import { errorHandler, makeColdSignal } from './utils'
import {
  default as TaskFetch,
  CreateTaskOptions,
  MoveTaskOptions,
  UpdateTaskOptions
} from '../fetchs/TaskFetch'
import { OrganizationData } from '../teambition'

export type detailType = 'complete'

export class TaskAPI {

  constructor() {
    TaskModel.destructor()
  }

  getTasklistUndone(_tasklistId: string): Observable<Task[]> {
    return makeColdSignal(observer => {
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

  getTasklistDone(_tasklistId: string, page = 1): Observable<Task[]> {
    return makeColdSignal(observer => {
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

  getOrgMyDueTasks(userId: string, organization: OrganizationData, page = 1): Observable<Task[]> {
    return makeColdSignal(observer => {
      const get = TaskModel.getOrganizationMyDueTasks(page)
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

  getOrgMyTasks(userId: string, organization: OrganizationData, page = 1): Observable<Task[]> {
    return makeColdSignal(observer => {
      const get = TaskModel.getOrganizationMyTasks(page)
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

  getOrgMyDoneTasks(userId: string, organization: OrganizationData, page = 1): Observable<Task[]> {
    return makeColdSignal(observer => {
      const get = TaskModel.getOrganizationMyDoneTasks(page)
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

  getOrgMyCreatedTasks(userId: string, organization: OrganizationData, page = 1): Observable<Task[]> {
    return makeColdSignal(observer => {
      const get = TaskModel.getOrganizationMyCreatedTasks(page)
      if (get) {
        return get
      }
      const maxId = TaskModel.getOrgMyCreatedMaxId()
      return Observable.fromPromise(TaskFetch.getOrgsTasksCreated(organization._id, page, maxId))
        .catch(err => errorHandler(observer, err))
        .concatMap(tasks => TaskModel.addOrganizationMyCreatedTasks(userId, organization, tasks, page))
    })
  }

  getOrgMyInvolvesTasks(userId: string, organization: OrganizationData, page = 1): Observable<Task[]> {
    return makeColdSignal(observer => {
      const get = TaskModel.getOrgInvolvesTasks(page)
      if (get) {
        return get
      }
      const maxId = TaskModel.getOrgMyInvolvesMaxId()
      return Observable.fromPromise(TaskFetch.getOrgsTasksInvolves(organization._id, page, maxId))
        .catch(err => errorHandler(observer, err))
        .concatMap(tasks => TaskModel.addOrgMyInvolvesTasks(userId, organization, tasks, page))
    })
  }

  getProjectTasks(_projectId: string, query?: {
    page?: number
    count?: number
    fileds?: string
  }): Observable<Task[]> {
    return makeColdSignal(observer => {
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

  get(_id: string, detailType?: detailType): Observable<Task> {
    return makeColdSignal(observer => {
      const get = TaskModel.getOne(_id)
      if (get && TaskModel.checkSchema(_id)) {
        return get
      }
      return Observable.fromPromise(TaskFetch.get(_id, detailType))
        .catch(err => errorHandler(observer, err))
        .concatMap(task => TaskModel.addOne(task))
    })
  }

  create(taskInfo: CreateTaskOptions): Observable<Task> {
    return Observable.create((observer: Observer<Task>) => {
      Observable.fromPromise(TaskFetch.create(taskInfo))
        .catch(err => {
          observer.error(err)
          return Observable.of(null)
        })
        .concatMap(task => TaskModel.addOne(task))
        .forEach(task => observer.next(task))
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
    })
  }

  move(_taskId: string, options: MoveTaskOptions): Observable<Task> {
    return Observable.create((observer: Observer<Task>) => {
      const promise = TaskFetch.move(_taskId, options)
      this._updateFromPromise(_taskId, observer, promise)
    })
  }

  updateContent(_taskId: string, content: string): Observable<Task> {
    return Observable.create((observer: Observer<Task>) => {
      const promise = TaskFetch.updateContent(_taskId, content)
      this._updateFromPromise(_taskId, observer, promise)
    })
  }

  updateDueDate(_taskId: string, dueDate: string): Observable<Task> {
    return Observable.create((observer: Observer<Task>) => {
      const promise = TaskFetch.updateDueDate(_taskId, dueDate)
      this._updateFromPromise(_taskId, observer, promise)
    })
  }

  updateExecutor(_taskId: string, _executorId: string): Observable<Task> {
    return Observable.create((observer: Observer<Task>) => {
      const promise = TaskFetch.updateExecutor(_taskId, _executorId)
      this._updateFromPromise(_taskId, observer, promise)
    })
  }

  updateInvolvemembers(_taskId: string, memberIds: string[], type: 'involveMembers' | 'addInvolvers' | 'delInvolvers'): Observable<Task> {
    return Observable.create((observer: Observer<Task>) => {
      const promise = TaskFetch.updateInvolvemembers(_taskId, memberIds, type)
      this._updateFromPromise(_taskId, observer, promise)
    })
  }

  updateNote(_taskId: string, note: string): Observable<Task> {
    return Observable.create((observer: Observer<Task>) => {
      const promise = TaskFetch.updateNote(_taskId, note)
      this._updateFromPromise(_taskId, observer, promise)
    })
  }

  updateStatus(_taskId: string, status: boolean): Observable<Task> {
    return Observable.create((observer: Observer<Task>) => {
      const promise = TaskFetch.updateStatus(_taskId, status)
      this._updateFromPromise(_taskId, observer, promise)
    })
  }

  update<T extends UpdateTaskOptions>(_taskId: string, patch: T): Observable<Task> {
    return Observable.create((observer: Observer<Task>) => {
      const promise = TaskFetch.update(_taskId, patch)
      this._updateFromPromise(_taskId, observer, promise)
    })
  }

  private _updateFromPromise(_taskId: string, observer: Observer<Task>, promise: Promise<any>) {
    Observable.fromPromise(promise)
      .catch(err => {
        observer.error(err)
        return TaskModel.getOne(_taskId)
      })
      .concatMap(task => TaskModel.update(_taskId, task))
      .forEach(task => observer.next(task))
  }
}
