'use strict'
import { Observable } from 'rxjs'
import BaseModel from './BaseModel'
import Collection from './BaseCollection'
import MaxIdCollection from './tasks/MaxIdCollection'
import Task from '../schemas/Task'
import { datasToSchemas, dataToSchema } from '../utils/index'
import { OrganizationData } from '../teambition'

export class TaskModel extends BaseModel {
  private _schemaName = 'Task'
  private _collections = new Map<string, Collection<any>>()

  destructor() {
    this._collections.clear()
  }

  /**
   * 不分页不用 Collection
   */
  addTasklistTasksUndone(_tasklistId: string, tasks: Task[]): Observable<Task[]> {
    const result = datasToSchemas<Task>(tasks, Task)
    return this._saveCollection(`tasklist:tasks:undone/${_tasklistId}`, result, this._schemaName, (data: Task) => {
      return data._tasklistId === _tasklistId && !data.isDone
    })
  }

  getTasklistTasksUndone(_tasklistId: string): Observable<Task[]> {
    return this._get<Task[]>(`tasklist:tasks:undone/${_tasklistId}`)
  }

  /**
   * _collections 的索引是 0
   */
  addTasklistTasksDone(_tasklistId: string, tasks: Task[], page: number): Observable<Task[]> {
    const result = datasToSchemas<Task>(tasks, Task)
    const name = '0'
    const dbIndex = `tasklist:tasks:done/${_tasklistId}`

    let collection: Collection<Task> = this._collections.get(name)

    if (!collection) {
      collection = new Collection<Task>(this._schemaName, (data: Task) => {
        return data._tasklistId === _tasklistId && data.isDone
      }, dbIndex)
      this._collections.set(name, collection)
    }

    return collection.addPage(page, result)
  }

  getTasklistTasksDone(_tasklistId: string, page: number): Observable<Task[]> {
    const collection = this._collections.get('0')
    if (collection) {
      return collection.get(page)
    }
    return null
  }

  /**
   * _collections 的索引是 1
   */
  addOrganizationMyDueTasks(userId: string, organization: OrganizationData, tasks: Task[], page: number): Observable<Task[]> {
    const dbIndex = `organization:tasks:due/${organization._id}`
    const result = datasToSchemas<Task>(tasks, Task)

    let collection: Collection<Task> = this._collections.get('1')

    if (!collection) {
      collection = new Collection(this._schemaName, (data: Task) => {
        return organization.projectIds instanceof Array &&
               organization.projectIds.indexOf(data._projectId) !== -1 &&
               !!data.dueDate &&
               data._executorId === userId
      }, dbIndex)
      this._collections.set('1', collection)
    }
    return collection.addPage(page, result)
  }

  getOrganizationMyDueTasks(page: number): Observable<Task[]> {
    const collection = this._collections.get('1')
    if (collection) {
      return collection.get(page)
    }
    return null
  }

  /**
   * _collections 的索引是 2
   */
  addOrganizationMyTasks(userId: string, organization: OrganizationData, tasks: Task[], page: number): Observable<Task[]> {
    const result = datasToSchemas<Task>(tasks, Task)
    const dbIndex = `organization:tasks/${organization._id}`

    let collection: Collection<Task> = this._collections.get('2')

    if (!collection) {
      collection = new Collection(this._schemaName, (data: Task) => {
        return organization.projectIds instanceof Array &&
               organization.projectIds.indexOf(data._projectId) !== -1 &&
               !data.dueDate &&
               data._executorId === userId
      }, dbIndex)
      this._collections.set('2', collection)
    }
    return collection.addPage(page, result)
  }

  getOrganizationMyTasks(page: number): Observable<Task[]> {
    const collection = this._collections.get('2')
    if (collection) {
      return collection.get(page)
    }
    return null
  }

  /**
   * _collections 的索引是 3
   */
  addOrganizationMyDoneTasks(userId: string, organization: OrganizationData, tasks: Task[], page: number): Observable<Task[]> {
    const result = datasToSchemas<Task>(tasks, Task)
    const dbIndex = `organization:tasks:done/${organization._id}`

    let collection: Collection<Task> = this._collections.get('3')

    if (!collection) {
      collection = new Collection(this._schemaName, (data: Task) => {
        return organization.projectIds instanceof Array &&
               organization.projectIds.indexOf(data._projectId) !== -1 &&
               data.isDone && data._executorId === userId
      }, dbIndex)
      this._collections.set('3', collection)
    }
    return collection.addPage(page, result)
  }

  getOrganizationMyDoneTasks(page: number): Observable<Task[]> {
    const collection = this._collections.get('3')
    if (collection) {
      return collection.get(page)
    }
    return null
  }

  /**
   * _collections 的索引是 4
   */
  addOrganizationMyCreatedTasks(userId: string, organization: OrganizationData, tasks: Task[], page: number): Observable<Task[]> {
    const result = datasToSchemas<Task>(tasks, Task)
    const dbIndex = `organization:tasks:created/${organization._id}`

    let collection: MaxIdCollection<Task> = <MaxIdCollection<Task>>this._collections.get('4')

    if (!collection) {
      collection = new MaxIdCollection(this._schemaName, (data: Task) => {
        return data._creatorId === userId && !data.isArchived
      }, dbIndex)
      this._collections.set('4', collection)
    }
    return collection.addPage(page, result)
  }

  getOrganizationMyCreatedTasks(page: number): Observable<Task[]> {
    const collection = this._collections.get('4')
    if (collection) {
      return collection.get(page)
    }
    return null
  }

  getOrgMyCreatedMaxId(): string {
    const collection = <MaxIdCollection<Task>>this._collections.get('4')
    if (collection) {
      return collection.maxId
    }
    return void 0
  }

  /**
   * _collections 的索引是 5
   */
  addOrgMyInvolvesTasks(userId: string, organization: OrganizationData, tasks: Task[], page: number): Observable<Task[]> {
    const result = datasToSchemas<Task>(tasks, Task)
    const dbIndex = `organization:tasks:involves/${organization._id}`

    let collection: MaxIdCollection<Task> = <MaxIdCollection<Task>>this._collections.get('5')

    if (!collection) {
      collection = new MaxIdCollection(this._schemaName, (data: Task) => {
        return data.involveMembers && data.involveMembers.indexOf(userId) !== -1 && !data.isArchived
      }, dbIndex)
      this._collections.set('5', collection)
    }
    return collection.addPage(page, result)
  }

  getOrgInvolvesTasks(page: number): Observable<Task[]> {
    const collection = this._collections.get('5')
    if (collection) {
      return collection.get(page)
    }
    return null
  }

  getOrgMyInvolvesMaxId(): string {
    const collection = <MaxIdCollection<Task>>this._collections.get('5')
    if (collection) {
      return collection.maxId
    }
    return void 0
  }

  /**
   * _collections 索引为 6
   */
  addProjectTasks(_projectId: string, tasks: Task[], page: number): Observable<Task[]> {
    const dbIndex = `project:tasks/${_projectId}`
    const result = datasToSchemas<Task>(tasks, Task)

    let collection: Collection<Task> = this._collections.get('6')

    if (!collection) {
      collection = new Collection(this._schemaName, (data: Task) => {
        return data._projectId === _projectId && !data.isArchived
      }, dbIndex)
      this._collections.set('6', collection)
    }

    return collection.addPage(page, result)
  }

  getProjectTasks(_projectId: string, page: number): Observable<Task[]> {
    const collection = this._collections.get('6')
    if (collection) {
      return collection.get(page)
    }
    return null
  }

  addOne(task: Task): Observable<Task> {
    const result = dataToSchema<Task>(task, Task)
    return this._save(result)
  }

  getOne(_id: string): Observable<Task> {
    return this._get<Task>(_id)
  }

  /**
   * 这里是为了 hack socket 推送的bug
   * 当变更一个 task 的非 executor 属性时，socket 推送的内容中 executor 永远为 null
   * 比如更改一个截止日期，socket 不仅推送新的截止日期，还附带了 executor: null
   */
  update(_taskId: string, patch: any): Observable<Task> {
    if (!patch._executorId && typeof patch.executor !== 'undefined') {
      delete patch.executor
    }
    return super.update<Task>(_taskId, patch)
  }
}

export default new TaskModel()
