'use strict'
import { Observable } from 'rxjs/Observable'
import SubtaskModel from '../models/SubtaskModel'
import TaskModel from '../models/TaskModel'
import {
  default as SubtaskFetch,
  SubtaskUpdateOptions,
  UpdateSubtaskContentResponse,
  UpdateSubtaskDuedateResponse,
  UpdateSubtaskExecutorResponse,
  UpdateSubtaskStatusResponse
} from '../fetchs/SubtaskFetch'
import { SubtaskData } from '../schemas/Subtask'
import { TaskData } from '../schemas/Task'
import { makeColdSignal } from './utils'
import { OrganizationData } from '../schemas/Organization'
import { isObject, assign } from '../utils/index'
import { SubtaskId, TaskId, IdOfMember } from '../teambition'

export class SubtaskAPI {

  getFromTask(_taskId: TaskId, query?: any): Observable<SubtaskData[]> {
    return makeColdSignal<SubtaskData[]>(() => {
      const get = SubtaskModel.getFromTask(_taskId)
      if (get) {
        return get
      }
      return SubtaskFetch.getFromTask(_taskId, query)
        .concatMap(subtasks =>
          SubtaskModel.addToTask(_taskId, subtasks)
        )
    })
  }

  get(_subtaskid: SubtaskId, _taskId?: TaskId, withExecutor?: boolean, query?: any): Observable<SubtaskData> {
    return makeColdSignal<SubtaskData>(() => {
      const get = SubtaskModel.getOne(_subtaskid)
      if (get && SubtaskModel.checkSchema(<string>_subtaskid)) {
        return get
      }
      const _query = {
        _taskId, withExecutor
      }
      if (isObject(query)) {
        assign(_query, query)
      }
      return SubtaskFetch.getOne(_subtaskid, _query)
        .concatMap(subtask =>
          SubtaskModel.addOne(subtask)
        )
    })
  }

  create(subtaskData: {
    content: string
    _taskId: TaskId
    _executorId?: IdOfMember
  }): Observable<SubtaskData> {
    return SubtaskFetch.create(subtaskData)
      .concatMap(subtask =>
        SubtaskModel.addOne(subtask)
          .take(1)
      )
  }

  update(_subtaskId: SubtaskId, options: SubtaskUpdateOptions): Observable<SubtaskUpdateOptions> {
    return SubtaskFetch.update(_subtaskId, options)
      .concatMap(subtask =>
        SubtaskModel.update(<string>_subtaskId, subtask)
      )
  }

  delete(_subtaskid: SubtaskId): Observable<void> {
    return SubtaskFetch.delete(_subtaskid)
      .concatMap(x =>
        SubtaskModel.delete(<string>_subtaskid)
      )
  }

  transform(_subtaskId: SubtaskId, doLink = false, doLinked = false): Observable<TaskData> {
    return SubtaskFetch.transform(_subtaskId, doLink, doLinked)
      .concatMap<TaskData>(x =>
        SubtaskModel.delete(<string>_subtaskId)
          .mapTo(x)
      )
      .concatMap<TaskData>(x =>
        TaskModel.addOne(x)
          .take(1)
          .mapTo(x)
        )
  }

  updateContent(_subtaskId: SubtaskId, content: string): Observable<UpdateSubtaskContentResponse> {
    return this._updateFromPromise(_subtaskId, SubtaskFetch.updateContent(_subtaskId, content))
  }

  updateDuedate(_subTaskId: SubtaskId, dueDate: string): Observable<UpdateSubtaskDuedateResponse> {
    return this._updateFromPromise(_subTaskId, SubtaskFetch.updateDuedate(_subTaskId, dueDate))
  }

  updateExecutor(_subTaskId: SubtaskId, _executorId: IdOfMember): Observable<UpdateSubtaskExecutorResponse> {
    return this._updateFromPromise(_subTaskId, SubtaskFetch.updateExecutor(_subTaskId, _executorId))
  }

  updateStatus(_subTaskId: SubtaskId, isDone: boolean): Observable<UpdateSubtaskStatusResponse> {
    return this._updateFromPromise(_subTaskId, SubtaskFetch.updateStatus(_subTaskId, isDone))
  }

  getOrgMySubtasks(userId: IdOfMember, organization: OrganizationData, page = 1, query?: any): Observable<SubtaskData[]> {
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
        .concatMap(subtasks =>
          SubtaskModel.addOrgMySubtasks(userId, organization, subtasks, page)
        )
    })
  }

  getOrgMyDueSubtasks(userId: IdOfMember, organization: OrganizationData, page = 1, query?: any): Observable<SubtaskData[]> {
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
        .concatMap(subtasks =>
          SubtaskModel.addOrgMyDueSubtasks(userId, organization, subtasks, page)
        )
    })
  }

  getOrgMyDoneSubtasks(userId: IdOfMember, organization: OrganizationData, page = 1, query?: any): Observable<SubtaskData[]> {
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
        .concatMap(subtasks =>
          SubtaskModel.addOrgMyDoneSubtasks(userId, organization, subtasks, page)
        )
    })
  }

  getOrgMyCreatedSubtasks(userId: IdOfMember, organization: OrganizationData, page = 1, query?: any): Observable<SubtaskData[]> {
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
        .concatMap(subtasks =>
          SubtaskModel.addOrgMyCreatedSubtasks(userId, organization, subtasks, page)
        )
    })
  }

  private _updateFromPromise<T>(_subtaskId: SubtaskId, request: Observable<T>): Observable<T> {
    return request.concatMap<T>(subtask =>
      SubtaskModel.update(<string>_subtaskId, subtask)
    )
  }
}

export default new SubtaskAPI
