'use strict'
import { Observable, Observer } from 'rxjs'
import TaskModel from '../models/TaskModel'
import Task from '../schemas/Task'
import { errorHandler, makeColdSignal } from './utils'
import {
  TaskFetch,
  CreateTaskOptions,
  MoveTaskOptions
} from '../fetchs/TaskFetch'
import { OrganizationData } from '../teambition'

const taskFetch = new TaskFetch()

export type detailType = 'complete'

export class TaskAPI {

  constructor() {
    TaskModel.$destroy()
  }

  getTasklistsUndone(_tasklistId: string): Observable<Task[]> {
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
      Observable.fromPromise(taskFetch.move(_taskId, options))
        .catch(err => {
          observer.error(err)
          return TaskModel.get(_taskId)
        })
        .concatMap(task => TaskModel.update<Task>(_taskId, task))
        .forEach(task => observer.next(task))
    })
  }

  updateContent(_taskId: string, content: string): Observable<Task> {
    return Observable.create((observer: Observer<Task>) => {
      Observable.fromPromise(taskFetch.updateContent(_taskId, content))
        .catch(err => {
          observer.error(err)
          return TaskModel.get(_taskId)
        })
        .concatMap(task => TaskModel.update<Task>(_taskId, task))
        .forEach(task => observer.next(task))
    })
  }

  updateDueDate(_taskId: string, dueDate: string): Observable<Task> {
    return Observable.create((observer: Observer<Task>) => {
      Observable.fromPromise(taskFetch.updateDueDate(_taskId, dueDate))
        .catch(err => {
          observer.error(err)
          return TaskModel.get(_taskId)
        })
        .concatMap(task => TaskModel.update<Task>(_taskId, task))
        .forEach(task => observer.next(task))
    })
  }
}
