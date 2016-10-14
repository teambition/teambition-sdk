'use strict'
import { Observable } from 'rxjs/Observable'
import SubtaskModel from '../models/SubtaskModel'
import TaskModel from '../models/TaskModel'
import { default as SubtaskFetch, SubtaskUpdateOptions } from '../fetchs/SubtaskFetch'
import { SubtaskData } from '../schemas/Subtask'
import { TaskData } from '../schemas/Task'
import { makeColdSignal } from './utils'
import { OrganizationData } from '../schemas/Organization'
import { isObject, assign } from '../utils/index'

export class SubtaskAPI {

  getFromTask(_taskId: string, query?: any): Observable<SubtaskData[]> {
    return makeColdSignal<SubtaskData[]>(() => {
      const get = SubtaskModel.getFromTask(_taskId)
      if (get) {
        return get
      }
      return SubtaskFetch.getFromTask(_taskId, query)
        .concatMap(subtasks => SubtaskModel.addToTask(_taskId, subtasks))
    })
  }

  get(_subtaskid: string, _taskId?: string, withExecutor?: boolean, query?: any): Observable<SubtaskData> {
    return makeColdSignal<SubtaskData>(() => {
      const get = SubtaskModel.getOne(_subtaskid)
      if (get && SubtaskModel.checkSchema(_subtaskid)) {
        return get
      }
      const _query = {
        _taskId, withExecutor
      }
      if (isObject(query)) {
        assign(_query, query)
      }
      return SubtaskFetch.getOne(_subtaskid, _query)
        .concatMap(subtask => SubtaskModel.addOne(subtask))
    })
  }

  create(subtaskData: {
    content: string
    _taskId: string
    _executorId?: string
  }): Observable<SubtaskData> {
    return SubtaskFetch.create(subtaskData)
      .concatMap(subtask => SubtaskModel.addOne(subtask).take(1))
  }

  update(_subtaskId: string, options: SubtaskUpdateOptions): Observable<SubtaskUpdateOptions> {
    return SubtaskFetch.update(_subtaskId, options)
      .concatMap(subtask => SubtaskModel.update(_subtaskId, subtask))
  }

  delete(_subtaskid: string): Observable<void> {
    return SubtaskFetch.delete(_subtaskid)
      .concatMap(x => SubtaskModel.delete(_subtaskid))
  }

  transform(_subtaskId: string, doLink = false, doLinked = false): Observable<TaskData> {
    return SubtaskFetch.transform(_subtaskId, doLink, doLinked)
      .concatMap<TaskData>(x => SubtaskModel.delete(_subtaskId).map(() => x))
      .concatMap<TaskData>(x => TaskModel.addOne(x).take(1).map(() => x))
  }

  updateContent(_subtaskId: string, content: string): Observable<SubtaskData> {
    return this._updateFromPromise(_subtaskId, SubtaskFetch.updateContent(_subtaskId, content))
  }

  updateDuedate(_subTaskId: string, dueDate: string): Observable<SubtaskData> {
    return this._updateFromPromise(_subTaskId, SubtaskFetch.updateDuedate(_subTaskId, dueDate))
  }

  updateExecutor(_subTaskId: string, _executorId: string): Observable<SubtaskData> {
    return this._updateFromPromise(_subTaskId, SubtaskFetch.updateExecutor(_subTaskId, _executorId))
  }

  updateStatus(_subTaskId: string, isDone: boolean): Observable<SubtaskData> {
    return this._updateFromPromise(_subTaskId, SubtaskFetch.updateStatus(_subTaskId, isDone))
  }

  getOrgMySubtasks(userId: string, organization: OrganizationData, page = 1, query?: any): Observable<SubtaskData[]> {
    return makeColdSignal<SubtaskData[]>(() => {
      const get = SubtaskModel.getOrgMySubtasks(organization._id, page)
      if (get) {
        return get
      }
      const _query = {
        page: page,
        isDone: false,
        hasDuedate: false
      }
      if (isObject(query)) {
        assign(_query, query)
      }
      return SubtaskFetch.getOrgsSubtasksMe(organization._id, _query)
        .concatMap(subtasks => SubtaskModel.addOrgMySubtasks(userId, organization, subtasks, page))
    })
  }

  getOrgMyDueSubtasks(userId: string, organization: OrganizationData, page = 1, query?: any): Observable<SubtaskData[]> {
    return makeColdSignal<SubtaskData[]>(() => {
      const get = SubtaskModel.getOrgMyDueSubtasks(organization._id, page)
      if (get) {
        return get
      }
      const _query = {
        page: page,
        isDone: false,
        hasDuedate: true
      }
      if (isObject(query)) {
        assign(_query, query)
      }
      return SubtaskFetch.getOrgsSubtasksMe(organization._id, _query)
        .concatMap(subtasks => SubtaskModel.addOrgMyDueSubtasks(userId, organization, subtasks, page))
    })
  }

  getOrgMyDoneSubtasks(userId: string, organization: OrganizationData, page = 1, query?: any): Observable<SubtaskData[]> {
    return makeColdSignal<SubtaskData[]>(() => {
      const get = SubtaskModel.getOrgMyDoneSubtasks(organization._id, page)
      if (get) {
        return get
      }
      const _query = {
        page: page,
        isDone: true
      }
      if (isObject(query)) {
        assign(_query, query)
      }
      return SubtaskFetch.getOrgsSubtasksMe(organization._id, _query)
        .concatMap(subtasks => SubtaskModel.addOrgMyDoneSubtasks(userId, organization, subtasks, page))
    })
  }

  getOrgMyCreatedSubtasks(userId: string, organization: OrganizationData, page = 1, query?: any): Observable<SubtaskData[]> {
    return makeColdSignal<SubtaskData[]>(() => {
      const get = SubtaskModel.getOrgMyCreatedSubtasks(organization._id, page)
      if (get) {
        return get
      }
      const maxId = SubtaskModel.getOrgMyCreatedMaxId(organization._id)
      const _query = { page, maxId }
      if (isObject(query)) {
        assign(_query, query)
      }
      return SubtaskFetch.getOrgsSubtasksCreated(organization._id, _query)
        .concatMap(subtasks => SubtaskModel.addOrgMyCreatedSubtasks(userId, organization, subtasks, page))
    })
  }

  private _updateFromPromise(_subtaskId: string, request: Observable<any>) {
    return request.concatMap(subtask => SubtaskModel.update<SubtaskData>(_subtaskId, subtask))
  }
}

export default new SubtaskAPI
