'use strict'
import { Observable } from 'rxjs/Observable'
import BaseModel from './BaseModel'
import Collection from './BaseCollection'
import MaxIdCollection from './tasks/MaxIdCollection'
import { TaskData, default as Task } from '../schemas/Task'
import { datasToSchemas, dataToSchema } from '../utils/index'
import { OrganizationData } from '../schemas/Organization'

export class TaskModel extends BaseModel {
  private _schemaName = 'Task'
  private _collections = new Map<string, Collection<any>>()

  destructor() {
    this._collections.clear()
  }

  /**
   * 不分页不用 Collection
   */
  addTasklistTasksUndone(_tasklistId: string, tasks: TaskData[]): Observable<TaskData[]> {
    const result = datasToSchemas<TaskData>(tasks, Task)
    return this._saveCollection(`tasklist:tasks:undone/${_tasklistId}`, result, this._schemaName, (data: TaskData) => {
      return data._tasklistId === _tasklistId && !data.isDone
    })
  }

  getTasklistTasksUndone(_tasklistId: string): Observable<TaskData[]> {
    return this._get<TaskData[]>(`tasklist:tasks:undone/${_tasklistId}`)
  }

  /**
   * _collections 的索引是 '_tasklistId'
   */
  addTasklistTasksDone(_tasklistId: string, tasks: TaskData[], page: number): Observable<TaskData[]> {
    const result = datasToSchemas<TaskData>(tasks, Task)
    const dbIndex = `tasklist:tasks:done/${_tasklistId}`
    const name = dbIndex

    let collection: Collection<TaskData> = this._collections.get(name)

    if (!collection) {
      collection = new Collection<TaskData>(this._schemaName, (data: Task) => {
        return data._tasklistId === _tasklistId && data.isDone
      }, dbIndex)
      this._collections.set(name, collection)
    }

    return collection.addPage(page, result)
  }

  getTasklistTasksDone(_tasklistId: string, page: number): Observable<TaskData[]> {
    const collection = this._collections.get(`tasklist:tasks:done/${_tasklistId}`)
    if (collection) {
      return collection.get(page)
    }
    return null
  }

  /**
   * _collections 的索引是 `organization:tasks:due/${organization._id}`
   */
  addOrganizationMyDueTasks(userId: string, organization: OrganizationData, tasks: TaskData[], page: number): Observable<TaskData[]> {
    const dbIndex = `organization:tasks:due/${organization._id}`
    const result = datasToSchemas<TaskData>(tasks, Task)

    let collection: Collection<TaskData> = this._collections.get(dbIndex)

    if (!collection) {
      collection = new Collection(this._schemaName, (data: Task) => {
        return organization.projectIds instanceof Array &&
               organization.projectIds.indexOf(data._projectId) !== -1 &&
               !!data.dueDate &&
               data._executorId === userId &&
               !data.isDone
      }, dbIndex)
      this._collections.set(dbIndex, collection)
    }
    return collection.addPage(page, result)
  }

  getOrganizationMyDueTasks(organizationId: string, page: number): Observable<TaskData[]> {
    const collection = this._collections.get(`organization:tasks:due/${organizationId}`)
    if (collection) {
      return collection.get(page)
    }
    return null
  }

  /**
   * _collections 的索引是 `organization:tasks/${organization._id}`
   */
  addOrganizationMyTasks(userId: string, organization: OrganizationData, tasks: TaskData[], page: number): Observable<TaskData[]> {
    const result = datasToSchemas<TaskData>(tasks, Task)
    const dbIndex = `organization:tasks/${organization._id}`

    let collection: Collection<TaskData> = this._collections.get(dbIndex)

    if (!collection) {
      collection = new Collection(this._schemaName, (data: Task) => {
        return organization.projectIds instanceof Array &&
               organization.projectIds.indexOf(data._projectId) !== -1 &&
               !data.dueDate &&
               data._executorId === userId &&
               !data.isDone
      }, dbIndex)
      this._collections.set(dbIndex, collection)
    }
    return collection.addPage(page, result)
  }

  getOrganizationMyTasks(organizationId: string, page: number): Observable<TaskData[]> {
    const collection = this._collections.get(`organization:tasks/${organizationId}`)
    if (collection) {
      return collection.get(page)
    }
    return null
  }

  /**
   * _collections 的索引是 `organization:tasks:done/${organization._id}`
   */
  addOrganizationMyDoneTasks(userId: string, organization: OrganizationData, tasks: TaskData[], page: number): Observable<TaskData[]> {
    const result = datasToSchemas<TaskData>(tasks, Task)
    const dbIndex = `organization:tasks:done/${organization._id}`

    let collection: Collection<TaskData> = this._collections.get(dbIndex)

    if (!collection) {
      collection = new Collection(this._schemaName, (data: Task) => {
        return organization.projectIds instanceof Array &&
               organization.projectIds.indexOf(data._projectId) !== -1 &&
               data.isDone && data._executorId === userId
      }, dbIndex)
      this._collections.set(dbIndex, collection)
    }
    return collection.addPage(page, result)
  }

  getOrganizationMyDoneTasks(organizationId: string, page: number): Observable<TaskData[]> {
    const collection = this._collections.get(`organization:tasks:done/${organizationId}`)
    if (collection) {
      return collection.get(page)
    }
    return null
  }

  /**
   * _collections 的索引是 `organization:tasks:created/${organization._id}`
   */
  addOrganizationMyCreatedTasks(userId: string, organization: OrganizationData, tasks: TaskData[], page: number): Observable<TaskData[]> {
    const result = datasToSchemas<TaskData>(tasks, Task)
    const dbIndex = `organization:tasks:created/${organization._id}`

    let collection: MaxIdCollection<TaskData> = <MaxIdCollection<TaskData>>this._collections.get(dbIndex)

    if (!collection) {
      collection = new MaxIdCollection(this._schemaName, (data: TaskData) => {
        return data._creatorId === userId && !data.isArchived
      }, dbIndex)
      this._collections.set(dbIndex, collection)
    }
    return collection.maxAddPage(page, result)
  }

  getOrganizationMyCreatedTasks(organizationId: string, page: number): Observable<TaskData[]> {
    const collection = this._collections.get(`organization:tasks:created/${organizationId}`)
    if (collection) {
      return collection.get(page)
    }
    return null
  }

  getOrgMyCreatedMaxId(organizationId: string): string {
    const collection = <MaxIdCollection<TaskData>>this._collections.get(`organization:tasks:created/${organizationId}`)
    if (collection) {
      return collection.maxId
    }
    return void 0
  }

  /**
   * _collections 的索引是 `organization:tasks:involves/${organization._id}`
   */
  addOrgMyInvolvesTasks(userId: string, organization: OrganizationData, tasks: TaskData[], page: number): Observable<TaskData[]> {
    const result = datasToSchemas<TaskData>(tasks, Task)
    const dbIndex = `organization:tasks:involves/${organization._id}`

    let collection: MaxIdCollection<TaskData> = <MaxIdCollection<TaskData>>this._collections.get(dbIndex)

    if (!collection) {
      collection = new MaxIdCollection(this._schemaName, (data: TaskData) => {
        return data.involveMembers && data.involveMembers.indexOf(userId) !== -1 && !data.isArchived
      }, dbIndex)
      this._collections.set(dbIndex, collection)
    }
    return collection.maxAddPage(page, result)
  }

  getOrgInvolvesTasks(organizationId: string, page: number): Observable<TaskData[]> {
    const collection = this._collections.get(`organization:tasks:involves/${organizationId}`)
    if (collection) {
      return collection.get(page)
    }
    return null
  }

  getOrgMyInvolvesMaxId(organizationId: string): string {
    const collection = <MaxIdCollection<TaskData>>this._collections.get(`organization:tasks:involves/${organizationId}`)
    if (collection) {
      return collection.maxId
    }
    return void 0
  }

  /**
   * _collections 索引为 `project:tasks/${_projectId}`
   */
  addProjectTasks(_projectId: string, tasks: TaskData[], page: number): Observable<TaskData[]> {
    const dbIndex = `project:tasks/${_projectId}`
    const result = datasToSchemas<TaskData>(tasks, Task)

    let collection: Collection<TaskData> = this._collections.get(dbIndex)

    if (!collection) {
      collection = new Collection(this._schemaName, (data: TaskData) => {
        return data._projectId === _projectId && !data.isArchived
      }, dbIndex)
      this._collections.set(dbIndex, collection)
    }

    return collection.addPage(page, result)
  }

  getProjectTasks(_projectId: string, page: number): Observable<TaskData[]> {
    const collection = this._collections.get(`project:tasks/${_projectId}`)
    if (collection) {
      return collection.get(page)
    }
    return null
  }

  addOne(task: TaskData): Observable<TaskData> {
    const result = dataToSchema<TaskData>(task, Task)
    return this._save(result)
  }

  getOne(_id: string): Observable<TaskData> {
    return this._get<TaskData>(_id)
  }

  /**
   * 这里是为了 hack socket 推送的bug
   * 当变更一个 task 的非 executor 属性时，socket 推送的内容中 executor 永远为 null
   * 比如更改一个截止日期，socket 不仅推送新的截止日期，还附带了 executor: null
   */
  update(_taskId: string, patch: any): Observable<TaskData> {
    if (!patch._executorId && typeof patch.executor !== 'undefined') {
      delete patch.executor
    }
    return super.update<TaskData>(_taskId, patch)
  }
}

export default new TaskModel()
