'use strict'
import {Observable} from 'rxjs'
import BaseModel from './BaseModel'
import Task from '../schemas/Task'
import {datasToSchemas, dataToSchema} from '../utils/index'
import {OrganizationData} from '../teambition'

export class TaskModel extends BaseModel {
  private _schemaName = 'Task'

  private _tasklistTasksDonePages: number[] = []
  private _tasklistTasksDone: Task[] = []

  private _organizationMyDueTasksPages: number[] = []
  private _organizationMyDueTasks: Task[] = []

  private _organizationMyTasksPages: number[] = []
  private _organizationMyTasks: Task[] = []

  addTasklistTasksUndone(_tasklistId: string, tasks: Task[]): Observable<Task[]> {
    const result = datasToSchemas<Task>(tasks, Task)
    return this._saveCollection(`tasklist:tasks:undone/${_tasklistId}`, result, this._schemaName, (data: Task) => {
      return data._tasklistId === _tasklistId && !data.isDone
    })
  }

  getTasklistTasksUndone(_tasklistId: string): Observable<Task[]> {
    return this._get<Task[]>(`tasklist:tasks:undone/${_tasklistId}`)
  }

  addTasklistTasksDone(_tasklistId: string, tasks: Task[], page: number): Observable<Task[]> {
    const result = datasToSchemas<Task>(tasks, Task)
    let destSignal: Observable<Task[]>
    this._tasklistTasksDone = this._tasklistTasksDone.concat(result)
    if (page === 1 || !this._tasklistTasksDonePages.length) {
      destSignal = this._saveCollection(`tasklist:tasks:done/${_tasklistId}`, this._tasklistTasksDone, this._schemaName, (data: Task) => {
        return data._tasklistId === _tasklistId && data.isDone
      })
    }else {
      destSignal = this._updateCollection<Task>(`tasklist:tasks:done/${_tasklistId}`, this._tasklistTasksDone)
    }
    if (this._tasklistTasksDonePages.indexOf(page) === -1) {
      this._tasklistTasksDonePages.push(page)
    }
    return destSignal
  }

  getTasklistTasksDone(_tasklistId: string, page: number): Observable<Task[]> {
    if (this._tasklistTasksDonePages.indexOf(page) !== -1) {
      return this._get<Task[]>(`tasklist:tasks:done/${_tasklistId}`)
        .skip((page - 1) * 30)
        .take(30)
    }
    return null
  }

  addOrganizationMyDueTasks(organization: OrganizationData, tasks: Task[], page: number): Observable<Task[]> {
    const result = datasToSchemas<Task>(tasks, Task)
    const organizationId = organization._id
    let destSignal: Observable<Task[]>
    this._organizationMyDueTasks = this._organizationMyDueTasks.concat(result)
    if (page === 1 || !this._organizationMyDueTasksPages.length) {
      destSignal = this._saveCollection(`organization:tasks:due/${organizationId}`, this._organizationMyDueTasks, this._schemaName, (data: Task) => {
        return organization.projectIds.indexOf(data._projectId) !== -1 && !!data.dueDate
      })
    }else {
      destSignal = this._updateCollection<Task>(`organization:tasks:due/${organizationId}`, this._organizationMyDueTasks)
    }
    if (this._organizationMyDueTasksPages.indexOf(page) === -1) {
      this._organizationMyDueTasksPages.push(page)
    }
    return destSignal
  }

  getOrganizationMyDueTasks(organizationId: string, page: number): Observable<Task[]> {
    if (this._organizationMyDueTasksPages.indexOf(page) !== -1) {
      return this._get<Task[]>(`organization:tasks:due/${organizationId}`)
        .skip((page - 1) * 30)
        .take(30)
    }
    return null
  }

  addOrganizationMyTasks(organization: OrganizationData, tasks: Task[], page: number): Observable<Task[]> {
    const result = datasToSchemas<Task>(tasks, Task)
    const organizationId = organization._id
    let destSignal: Observable<Task[]>
    this._organizationMyTasks = this._organizationMyTasks.concat(result)
    if (page === 1 || !this._organizationMyTasksPages.length) {
      destSignal = this._saveCollection(`organization:tasks/${organizationId}`, this._organizationMyTasks, this._schemaName, (data: Task) => {
        return organization.projectIds.indexOf(data._projectId) !== -1 && !data.dueDate
      })
    }else {
      destSignal = this._updateCollection<Task>(`organization:tasks/${organizationId}`, this._organizationMyTasks)
    }
    if (this._organizationMyTasksPages.indexOf(page) === -1) {
      this._organizationMyTasksPages.push(page)
    }
    return destSignal
  }

  getOrganizationMyTasks(organizationId: string, page: number): Observable<Task[]> {
    if (this._organizationMyTasksPages.indexOf(page) !== -1) {
      return this._get<Task[]>(`organization:tasks/${organizationId}`)
        .skip((page - 1) * 30)
        .take(30)
    }
    return null
  }

  add(task: Task): Observable<Task> {
    const result = dataToSchema<Task>(task, Task)
    return this._save(result)
  }

  get(_id: string): Observable<Task> {
    return this._get<Task>(_id)
  }

  $destroy() {
    this._tasklistTasksDonePages = []
    this._tasklistTasksDone = []
    this._organizationMyDueTasksPages = []
    this._organizationMyDueTasks = []
    this._organizationMyTasksPages = []
    this._organizationMyTasks = []
  }
}

export default new TaskModel()
