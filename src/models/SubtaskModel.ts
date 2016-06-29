'use strict'
import { Observable } from 'rxjs'
import BaseModel from './BaseModel'
import Collection from './BaseCollection'
import MaxIdCollection from './tasks/MaxIdCollection'
import Subtask from '../schemas/Subtask'
import { datasToSchemas, dataToSchema } from '../utils/index'
import { OrganizationData } from '../schemas/Organization'

export class SubtaskModel extends BaseModel {

  private _schemaName = 'Subtask'
  private _collections = new Map<string, Collection<any>>()

  destructor() {
    this._collections.clear()
  }

  addOne(subtask: Subtask): Observable<Subtask> {
    const result = dataToSchema<Subtask>(subtask, Subtask)
    return this._save(result)
  }

  getOne(_subtaskId: string): Observable<Subtask> {
    return this._get<Subtask>(_subtaskId)
  }

  /**
   * 不分页不用 Collection
   */
  addToTask(_taskId: string, subtasks: Subtask[]): Observable<Subtask[]> {
    const result = datasToSchemas<Subtask>(subtasks, Subtask)
    return this._saveCollection(`task:subtasks/${_taskId}`, result, this._schemaName, (data: Subtask) => {
      return data._taskId === _taskId
    })
  }

  getFromTask(_taskId: string): Observable<Subtask[]> {
    return this._get<Subtask[]>(`task:subtasks/${_taskId}`)
  }

  /**
   * _collections 索引是 `organization:subtasks/${organization._id}`
   */
  addOrgMySubtasks(userId: string, organization: OrganizationData, tasks: Subtask[], page: number): Observable<Subtask[]> {
    const result = datasToSchemas<Subtask>(tasks, Subtask)
    const dbIndex = `organization:subtasks/${organization._id}`

    let collection = this._collections.get(dbIndex)

    if (!collection) {
      collection = new Collection(this._schemaName, (data: Subtask) => {
        return organization.projectIds.indexOf(data._projectId) !== -1 && !data.dueDate && data._executorId === userId
      }, dbIndex)
      this._collections.set(dbIndex, collection)
    }
    return collection.addPage(page, result)
  }

  getOrgMySubtasks(organizationId: string, page: number): Observable<Subtask[]> {
    const collection = this._collections.get(`organization:subtasks/${organizationId}`)
    if (collection) {
      return collection.get(page)
    }
    return null
  }

  /**
   * _collections 的索引是 `organization:subtasks:due/${organization._id}`
   */
  addOrgMyDueSubtasks(userId: string, organization: OrganizationData, subtasks: Subtask[], page: number): Observable<Subtask[]> {
    const dbIndex = `organization:subtasks:due/${organization._id}`
    const result = datasToSchemas<Subtask>(subtasks, Subtask)

    let collection: Collection<Subtask> = this._collections.get(dbIndex)

    if (!collection) {
      collection = new Collection(this._schemaName, (data: Subtask) => {
        return organization.projectIds.indexOf(data._projectId) !== -1 && !!data.dueDate && data._executorId === userId
      }, dbIndex)
      this._collections.set(dbIndex, collection)
    }
    return collection.addPage(page, result)
  }

  getOrgMyDueSubtasks(organizationId: string, page: number): Observable<Subtask[]> {
    const collection = this._collections.get(`organization:subtasks:due/${organizationId}`)
    if (collection) {
      return collection.get(page)
    }
    return null
  }

  /**
   * _collections 的索引是 `organization:subtasks:done/${organization._id}`
   */
  addOrgMyDoneSubtasks(userId: string, organization: OrganizationData, tasks: Subtask[], page: number): Observable<Subtask[]> {
    const result = datasToSchemas<Subtask>(tasks, Subtask)
    const dbIndex = `organization:subtasks:done/${organization._id}`

    let collection: Collection<Subtask> = this._collections.get(dbIndex)

    if (!collection) {
      collection = new Collection(this._schemaName, (data: Subtask) => {
        return organization.projectIds.indexOf(data._projectId) !== -1 && data.isDone && data._executorId === userId
      }, dbIndex)
      this._collections.set(dbIndex, collection)
    }
    return collection.addPage(page, result)
  }

  getOrgMyDoneSubtasks(organizationId: string, page: number): Observable<Subtask[]> {
    const collection = this._collections.get(`organization:subtasks:done/${organizationId}`)
    if (collection) {
      return collection.get(page)
    }
    return null
  }

  /**
   * _collections 的索引是 `organization:subtasks:created/${organization._id}`
   */
  addOrgMyCreatedSubtasks(userId: string, organization: OrganizationData, tasks: Subtask[], page: number): Observable<Subtask[]> {
    const result = datasToSchemas<Subtask>(tasks, Subtask)
    const dbIndex = `organization:subtasks:created/${organization._id}`

    let collection: MaxIdCollection<Subtask> = <MaxIdCollection<Subtask>>this._collections.get(dbIndex)

    if (!collection) {
      collection = new MaxIdCollection(this._schemaName, (data: Subtask) => {
        return organization.projectIds.indexOf(data._projectId) !== -1 && data.isDone && data._executorId === userId
      }, dbIndex)
      this._collections.set(dbIndex, collection)
    }
    return collection.maxAddPage(page, result)
  }

  getOrgMyCreatedSubtasks(organizationId: string, page: number): Observable<Subtask[]> {
    const collection = this._collections.get(`organization:subtasks:created/${organizationId}`)
    if (collection) {
      return collection.get(page)
    }
    return null
  }

  getOrgMyCreatedMaxId(organizationId: string): string {
    const collection: MaxIdCollection<Subtask> = <MaxIdCollection<Subtask>>this._collections.get(`organization:subtasks:created/${organizationId}`)
    if (collection) {
      return collection.maxId
    }
    return void 0
  }
}

export default new SubtaskModel()
