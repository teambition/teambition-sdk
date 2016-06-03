'use strict'
import { Observable } from 'rxjs'
import BaseModel from './BaseModel'
import Collection from './BaseCollection'
import MaxIdCollection from './tasks/MaxIdCollection'
import Subtask from '../schemas/Subtask'
import { datasToSchemas, dataToSchema } from '../utils/index'
import { OrganizationData } from '../teambition'

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
   * _collections 索引是0
   */
  addOrgMySubtasks(userId: string, organization: OrganizationData, tasks: Subtask[], page: number): Observable<Subtask[]> {
    const result = datasToSchemas<Subtask>(tasks, Subtask)
    const dbIndex = `organization:subtasks/${organization._id}`

    let collection = this._collections.get('0')

    if (!collection) {
      collection = new Collection(this._schemaName, (data: Subtask) => {
        return organization.projectIds.indexOf(data._projectId) !== -1 && !data.dueDate && data._executorId === userId
      }, dbIndex)
      this._collections.set('0', collection)
    }
    return collection.addPage(page, result)
  }

  getOrgMySubtasks(page: number): Observable<Subtask[]> {
    const collection = this._collections.get('0')
    if (collection) {
      return collection.get(page)
    }
    return null
  }

  /**
   * _collections 的索引是 1
   */
  addOrgMyDueSubtasks(userId: string, organization: OrganizationData, subtasks: Subtask[], page: number): Observable<Subtask[]> {
    const dbIndex = `organization:subtasks:due/${organization._id}`
    const result = datasToSchemas<Subtask>(subtasks, Subtask)

    let collection: Collection<Subtask> = this._collections.get('1')

    if (!collection) {
      collection = new Collection(this._schemaName, (data: Subtask) => {
        return organization.projectIds.indexOf(data._projectId) !== -1 && !!data.dueDate && data._executorId === userId
      }, dbIndex)
      this._collections.set('1', collection)
    }
    return collection.addPage(page, result)
  }

  getOrgMyDueSubtasks(page: number): Observable<Subtask[]> {
    const collection = this._collections.get('1')
    if (collection) {
      return collection.get(page)
    }
    return null
  }

  /**
   * _collections 的索引是 2
   */
  addOrgMyDoneSubtasks(userId: string, organization: OrganizationData, tasks: Subtask[], page: number): Observable<Subtask[]> {
    const result = datasToSchemas<Subtask>(tasks, Subtask)
    const dbIndex = `organization:subtasks:done/${organization._id}`

    let collection: Collection<Subtask> = this._collections.get('2')

    if (!collection) {
      collection = new Collection(this._schemaName, (data: Subtask) => {
        return organization.projectIds.indexOf(data._projectId) !== -1 && data.isDone && data._executorId === userId
      }, dbIndex)
      this._collections.set('2', collection)
    }
    return collection.addPage(page, result)
  }

  getOrgMyDoneSubtasks(page: number): Observable<Subtask[]> {
    const collection = this._collections.get('2')
    if (collection) {
      return collection.get(page)
    }
    return null
  }

  /**
   * _collections 的索引是 3
   */
  addOrgMyCreatedSubtasks(userId: string, organization: OrganizationData, tasks: Subtask[], page: number): Observable<Subtask[]> {
    const result = datasToSchemas<Subtask>(tasks, Subtask)
    const dbIndex = `organization:subtasks:created/${organization._id}`

    let collection: MaxIdCollection<Subtask> = <MaxIdCollection<Subtask>>this._collections.get('3')

    if (!collection) {
      collection = new MaxIdCollection(this._schemaName, (data: Subtask) => {
        return organization.projectIds.indexOf(data._projectId) !== -1 && data.isDone && data._executorId === userId
      }, dbIndex)
      this._collections.set('3', collection)
    }
    return collection.addPage(page, result)
  }

  getOrgMyCreatedSubtasks(page: number): Observable<Subtask[]> {
    const collection = this._collections.get('3')
    if (collection) {
      return collection.get(page)
    }
    return null
  }

  getOrgMyCreatedMaxId(): string {
    const collection: MaxIdCollection<Subtask> = <MaxIdCollection<Subtask>>this._collections.get('3')
    if (collection) {
      return collection.maxId
    }
    return void 0
  }
}

export default new SubtaskModel()
