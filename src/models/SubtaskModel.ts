'use strict'
import { Observable } from 'rxjs'
import BaseModel from './BaseModel'
import Collection from './BaseCollection'
import Subtask from '../schemas/Subtask'
import { datasToSchemas, dataToSchema } from '../utils/index'
import { OrganizationData } from '../teambition'

export class SubtaskModel extends BaseModel {

  private _schemaName = 'Subtask'
  private _collections = new Map<string, Collection<any>>()

  destructor() {
    this._collections.clear()
  }

  add(subtask: Subtask): Observable<Subtask> {
    const result = dataToSchema<Subtask>(subtask, Subtask)
    return this._save(result)
  }

  get(_subtaskId: string): Observable<Subtask> {
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
  addOrganizationMySubtasks(userId: string, organization: OrganizationData, tasks: Subtask[], page: number): Observable<Subtask[]> {
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

  getOrganizationMySubtasks(page: number): Observable<Subtask[]> {
    const collection = this._collections.get('0')
    if (collection) {
      return collection.get(page)
    }
    return null
  }

  /**
   * _collections 的索引是 1
   */
  addOrganizationMyDueSubtasks(userId: string, organization: OrganizationData, subtasks: Subtask[], page: number): Observable<Subtask[]> {
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

  getOrganizationMyDueSubtasks(page: number): Observable<Subtask[]> {
    const collection = this._collections.get('1')
    if (collection) {
      return collection.get(page)
    }
    return null
  }

  /**
   * _collections 的索引是 2
   */
  addOrganizationMyDoneSubtasks(userId: string, organization: OrganizationData, tasks: Subtask[], page: number): Observable<Subtask[]> {
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

  getOrganizationMyDoneSubtasks(page: number): Observable<Subtask[]> {
    const collection = this._collections.get('2')
    if (collection) {
      return collection.get(page)
    }
    return null
  }
}

export default new SubtaskModel()
