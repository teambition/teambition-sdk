'use strict'
import { Observable } from 'rxjs/Observable'
import BaseModel from './BaseModel'
import Collection from './BaseCollection'
import MaxIdCollection from './tasks/MaxIdCollection'
import { SubtaskData, default as Subtask } from '../schemas/Subtask'
import { datasToSchemas, dataToSchema } from '../utils/index'
import { OrganizationData } from '../schemas/Organization'
import {
  TaskId,
  SubtaskId,
  UserId,
  OrganizationId
} from '../teambition'

export class SubtaskModel extends BaseModel {

  private _schemaName = 'Subtask'

  addOne(subtask: SubtaskData): Observable<SubtaskData> {
    const result = dataToSchema<SubtaskData>(subtask, Subtask)
    return this._save(result)
  }

  getOne(_subtaskId: SubtaskId): Observable<SubtaskData> {
    return this._get<SubtaskData>(<any>_subtaskId)
  }

  /**
   * 不分页不用 Collection
   */
  addToTask(_taskId: TaskId, subtasks: SubtaskData[]): Observable<SubtaskData[]> {
    const result = datasToSchemas<SubtaskData>(subtasks, Subtask)
    return this._saveCollection(`task:subtasks/${_taskId}`, result, this._schemaName, (data: SubtaskData) => {
      return data._taskId === _taskId
    })
  }

  getFromTask(_taskId: TaskId): Observable<SubtaskData[]> {
    return this._get<SubtaskData[]>(`task:subtasks/${_taskId}`)
  }

  /**
   * _collections 索引是 `organization:subtasks/${organization._id}`
   */
  addOrgMySubtasks(
    userId: UserId,
    organization: OrganizationData,
    tasks: SubtaskData[],
    page: number
  ): Observable<SubtaskData[]> {
    const result = datasToSchemas<SubtaskData>(tasks, Subtask)
    const dbIndex = `organization:subtasks/${organization._id}`

    let collection = this._collections.get(dbIndex)

    if (!collection) {
      collection = new Collection(this._schemaName, (data: SubtaskData) => {
        return organization.projectIds.indexOf(data._projectId) !== -1 &&
          !data.dueDate &&
          data._executorId === userId &&
          !data.isDone
      }, dbIndex)
      this._collections.set(dbIndex, collection)
    }
    return collection.addPage(page, result)
  }

  getOrgMySubtasks(organizationId: OrganizationId, page: number): Observable<SubtaskData[]> {
    const collection = this._collections.get(`organization:subtasks/${organizationId}`)
    if (collection) {
      return collection.get(page)
    }
    return null
  }

  /**
   * _collections 的索引是 `organization:subtasks:due/${organization._id}`
   */
  addOrgMyDueSubtasks(
    userId: UserId,
    organization: OrganizationData,
    subtasks: SubtaskData[],
    page: number
  ): Observable<SubtaskData[]> {
    const dbIndex = `organization:subtasks:due/${organization._id}`
    const result = datasToSchemas<SubtaskData>(subtasks, Subtask)

    let collection: Collection<SubtaskData> = this._collections.get(dbIndex)

    if (!collection) {
      collection = new Collection(this._schemaName, (data: SubtaskData) => {
        return organization.projectIds.indexOf(data._projectId) !== -1 &&
          !!data.dueDate &&
          data._executorId === userId &&
          !data.isDone
      }, dbIndex)
      this._collections.set(dbIndex, collection)
    }
    return collection.addPage(page, result)
  }

  getOrgMyDueSubtasks(organizationId: OrganizationId, page: number): Observable<SubtaskData[]> | null {
    const collection = this._collections.get(`organization:subtasks:due/${organizationId}`)
    if (collection) {
      return collection.get(page)
    }
    return null
  }

  /**
   * _collections 的索引是 `organization:subtasks:done/${organization._id}`
   */
  addOrgMyDoneSubtasks(
    userId: UserId,
    organization: OrganizationData,
    tasks: SubtaskData[],
    page: number
  ): Observable<SubtaskData[]> | null {
    const result = datasToSchemas<SubtaskData>(tasks, Subtask)
    const dbIndex = `organization:subtasks:done/${organization._id}`

    let collection: Collection<SubtaskData> = this._collections.get(dbIndex)

    if (!collection) {
      collection = new Collection(this._schemaName, (data: SubtaskData) => {
        return organization.projectIds.indexOf(data._projectId) !== -1 && data.isDone && data._executorId === userId
      }, dbIndex)
      this._collections.set(dbIndex, collection)
    }
    return collection.addPage(page, result)
  }

  getOrgMyDoneSubtasks(organizationId: OrganizationId, page: number): Observable<SubtaskData[]> {
    const collection = this._collections.get(`organization:subtasks:done/${organizationId}`)
    if (collection) {
      return collection.get(page)
    }
    return null
  }

  /**
   * _collections 的索引是 `organization:subtasks:created/${organization._id}`
   */
  addOrgMyCreatedSubtasks(
    userId: UserId,
    organization: OrganizationData,
    tasks: SubtaskData[],
    page: number
  ): Observable<SubtaskData[]> {
    const result = datasToSchemas<SubtaskData>(tasks, Subtask)
    const dbIndex = `organization:subtasks:created/${organization._id}`

    let collection: MaxIdCollection<SubtaskData> = <MaxIdCollection<SubtaskData>>this._collections.get(dbIndex)

    if (!collection) {
      collection = new MaxIdCollection(this._schemaName, (data: SubtaskData) => {
        return organization.projectIds.indexOf(data._projectId) !== -1 && data._executorId === userId
      }, dbIndex)
      this._collections.set(dbIndex, collection)
    }
    return collection.maxAddPage(page, result)
  }

  getOrgMyCreatedSubtasks(organizationId: OrganizationId, page: number): Observable<SubtaskData[]> | null {
    const collection = this._collections.get(`organization:subtasks:created/${organizationId}`)
    if (collection) {
      return collection.get(page)
    }
    return null
  }

  getOrgMyCreatedMaxId(organizationId: OrganizationId): number | undefined {
    const dbIndex = `organization:subtasks:created/${organizationId}`
    const collection: MaxIdCollection<SubtaskData> = <MaxIdCollection<SubtaskData>>this._collections.get(dbIndex)
    if (collection) {
      return collection.maxId
    }
    return void 0
  }
}

export default new SubtaskModel
