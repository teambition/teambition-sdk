'use strict'
import {Observable} from 'rxjs'
import TaskModel from '../models/TaskModel'
import Task from '../schemas/Task'
import {TaskFetch} from '../fetchs/TaskFetch'
import {OrganizationData} from '../teambition'

const taskFetch = new TaskFetch()

export class TaskAPI {

  constructor() {
    TaskModel.$destroy()
  }

  getTasklistsUndone(_tasklistId: string): Observable<Task[]> {
    const get = TaskModel.getTasklistTasksUndone(_tasklistId)
    if (get) {
      return get
    }
    return Observable.fromPromise(taskFetch.getByTasklist(_tasklistId, {
      isDone: false
    }))
      .concatMap(tasks => TaskModel.addTasklistTasksUndone(_tasklistId, tasks))
  }

  getTasklistDone(_tasklistId: string, page = 1): Observable<Task[]> {
    const get = TaskModel.getTasklistTasksDone(_tasklistId, page)
    if (get) {
      return get
    }
    return Observable.fromPromise(taskFetch.getByTasklist(_tasklistId, {
      isDone: true,
      page: page,
      limit: 30
    }))
      .concatMap(tasks => TaskModel.addTasklistTasksDone(_tasklistId, tasks, page))
  }

  getOrganizationMyDueTasks(organization: OrganizationData, page = 1): Observable<Task[]> {
    const get = TaskModel.getOrganizationMyDueTasks(organization._id, page)
    if (get) {
      return get
    }
    return Observable.fromPromise(taskFetch.getOrgsTasksMe(organization._id, {
      page: page,
      isDone: false,
      hasDuedate: true
    }))
      .concatMap(tasks => TaskModel.addOrganizationMyDueTasks(organization, tasks, page))
  }
}

