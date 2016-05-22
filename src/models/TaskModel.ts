'use strict'
import { Observable } from 'rxjs'
import BaseModel from './BaseModel'
import Task from '../schemas/Task'
import { datasToSchemas, dataToSchema, forEach, concat } from '../utils/index'
import { OrganizationData } from '../teambition'

export class TaskModel extends BaseModel {
  private _schemaName = 'Task'
  private _cache = new Map<string, {
    pages: number[]
    data: Task[]
  }>()
  private _cacheNames = ['tasklistTasksDone', 'organizationMyTasks', 'organizationMyDueTasks', 'organizationMyDoneTasks']

  constructor() {
    super()
    this._initCache()
  }

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
    const name = 'tasklistTasksDone'
    const cacheData = this._cache.get(name).data
    const pages = this._cache.get(name).pages
    let destSignal: Observable<Task[]>
    concat(cacheData, result)
    if (page === 1 || !pages.length) {
      destSignal = this._saveCollection(`tasklist:tasks:done/${_tasklistId}`, cacheData, this._schemaName, (data: Task) => {
        return data._tasklistId === _tasklistId && data.isDone
      })
    }else {
      destSignal = this._updateCollection<Task>(`tasklist:tasks:done/${_tasklistId}`, cacheData)
    }
    if (pages.indexOf(page) === -1) {
      pages.push(page)
    }
    return destSignal
  }

  getTasklistTasksDone(_tasklistId: string, page: number): Observable<Task[]> {
    const pages = this._cache.get('tasklistTasksDone').pages
    if (pages.indexOf(page) !== -1) {
      return this._get<Task[]>(`tasklist:tasks:done/${_tasklistId}`)
        .skip((page - 1) * 30)
        .take(30)
    }
    return null
  }

  addOrganizationMyDueTasks(organization: OrganizationData, tasks: Task[], page: number): Observable<Task[]> {
    const result = datasToSchemas<Task>(tasks, Task)
    const organizationId = organization._id
    const name = 'organizationMyDueTasks'
    const cacheData = this._cache.get(name).data
    const pages = this._cache.get(name).pages
    let destSignal: Observable<Task[]>
    concat(cacheData, result)
    if (page === 1 || !pages.length) {
      destSignal = this._saveCollection(`organization:tasks:due/${organizationId}`, cacheData, this._schemaName, (data: Task) => {
        return organization.projectIds.indexOf(data._projectId) !== -1 && !!data.dueDate
      })
    }else {
      destSignal = this._updateCollection<Task>(`organization:tasks:due/${organizationId}`, cacheData)
    }
    if (pages.indexOf(page) === -1) {
      pages.push(page)
    }
    return destSignal
  }

  getOrganizationMyDueTasks(organizationId: string, page: number): Observable<Task[]> {
    const pages = this._cache.get('organizationMyDueTasks').pages
    if (pages.indexOf(page) !== -1) {
      return this._get<Task[]>(`organization:tasks:due/${organizationId}`)
        .skip((page - 1) * 30)
        .take(30)
    }
    return null
  }

  addOrganizationMyTasks(organization: OrganizationData, tasks: Task[], page: number): Observable<Task[]> {
    const result = datasToSchemas<Task>(tasks, Task)
    const organizationId = organization._id
    const name = 'organizationMyTasks'
    const cacheData = this._cache.get(name).data
    const pages = this._cache.get(name).pages
    let destSignal: Observable<Task[]>
    concat(cacheData, result)
    if (page === 1 || !pages.length) {
      destSignal = this._saveCollection(`organization:tasks/${organizationId}`, cacheData, this._schemaName, (data: Task) => {
        return organization.projectIds.indexOf(data._projectId) !== -1 && !data.dueDate
      })
    }else {
      destSignal = this._updateCollection<Task>(`organization:tasks/${organizationId}`, cacheData)
    }
    if (pages.indexOf(page) === -1) {
      pages.push(page)
    }
    return destSignal
  }

  getOrganizationMyTasks(organizationId: string, page: number): Observable<Task[]> {
    const pages = this._cache.get('organizationMyTasks').pages
    if (pages.indexOf(page) !== -1) {
      return this._get<Task[]>(`organization:tasks/${organizationId}`)
        .skip((page - 1) * 30)
        .take(30)
    }
    return null
  }

  addOrganizationMyDoneTasks(organization: OrganizationData, tasks: Task[], page: number): Observable<Task[]> {
    const result = datasToSchemas<Task>(tasks, Task)
    const organizationId = organization._id
    const name = 'organizationMyDoneTasks'
    const cacheData = this._cache.get(name).data
    const pages = this._cache.get(name).pages
    let destSignal: Observable<Task[]>
    concat(cacheData, result)
    if (page === 1 || !pages.length) {
      destSignal = this._saveCollection(`organization:tasks:done/${organizationId}`, cacheData, this._schemaName, (data: Task) => {
        return organization.projectIds.indexOf(data._projectId) !== -1 && data.isDone
      })
    }else {
      destSignal = this._updateCollection<Task>(`organization:tasks:done/${organizationId}`, cacheData)
    }
    if (pages.indexOf(page) === -1) {
      pages.push(page)
    }
    return destSignal
  }

  getOrganizationMyDoneTasks(organizationId: string, page: number): Observable<Task[]> {
    const pages = this._cache.get('organizationMyDoneTasks').pages
    if (pages.indexOf(page) !== -1) {
      return this._get<Task[]>(`organization:tasks:done/${organizationId}`)
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
    this._initCache()
  }

  private _initCache() {
    this._cache.clear()
    forEach(this._cacheNames, cacheName => {
      this._cache.set(cacheName, {
        pages: [],
        data: []
      })
    })
  }
}

export default new TaskModel()
