'use strict'
import { Observable } from 'rxjs/Observable'
import TaskModel from '../models/TaskModel'
import { TaskData } from '../schemas/Task'
import { makeColdSignal } from './utils'
import Dirty from '../utils/Dirty'
import {
  default as TaskFetch,
  CreateTaskOptions,
  MoveTaskOptions,
  UpdateTaskOptions,
  ForkTaskOptions,
  GetStageTasksOptions,
  ArchiveTaskResponse,
  UpdateNoteResponse,
  UpdateTagsResponse,
  UpdateStatusResponse,
  UpdateContentResponse,
  UpdateDueDateResponse,
  UpdateInvolveMembersResponse,
  UpdateExecutorResponse
} from '../fetchs/TaskFetch'
import { OrganizationData } from '../schemas/Organization'
import { assign, isObject } from '../utils/index'

export type detailType = 'complete'

export class TaskAPI {

  getTasklistUndone(_tasklistId: string, query?: any): Observable<TaskData[]> {
    return makeColdSignal<TaskData[]>(() => {
      const get = TaskModel.getTasklistTasksUndone(_tasklistId)
      if (get) {
        return get
      }
      const _query = {
        isDone: false
      }
      if (isObject(query)) {
        assign(_query, query)
      }
      return TaskFetch.getByTasklist(_tasklistId, _query)
        .concatMap(tasks => TaskModel.addTasklistTasksUndone(_tasklistId, tasks))
    })
  }

  getMyDueTasks(_userId: string, query?: any): Observable<TaskData[]> {
    return makeColdSignal<TaskData[]>(() => {
      const get = TaskModel.getMyDueTasks()
      if (get) {
        return get
      }
      const _query = {
        count: 500,
        page: 1,
        hasDueDate: true,
        isDone: false
      }
      if (isObject(query)) {
        assign(_query, query)
      }
      return TaskFetch.getTasksMe(_query)
        .map(Dirty.handlerMytasksApi)
        .concatMap(tasks => TaskModel.addMyDueTasks(_userId, tasks))
    })
  }

  getMyTasks(_userId: string, query?: any): Observable<TaskData[]> {
    return makeColdSignal<TaskData[]>(() => {
      const get = TaskModel.getMyTasks()
      if (get) {
        return get
      }
      const _query = {
        count: 500,
        page: 1,
        hasDueDate: false,
        isDone: false
      }
      if (isObject(query)) {
        assign(_query, query)
      }
      return TaskFetch.getTasksMe(_query)
        .map(Dirty.handlerMytasksApi)
        .concatMap(tasks => TaskModel.addMyTasks(_userId, tasks))
    })
  }

  getTasklistDone(_tasklistId: string, page = 1, query?: any): Observable<TaskData[]> {
    return makeColdSignal<TaskData[]>(() => {
      const get = TaskModel.getTasklistTasksDone(_tasklistId, page)
      if (get) {
        return get
      }
      const _query = {
        isDone: true,
        page: page,
        limit: 30
      }
      if (query) {
        assign(_query, query)
      }
      return TaskFetch.getByTasklist(_tasklistId, _query)
        .concatMap(tasks => TaskModel.addTasklistTasksDone(_tasklistId, tasks, page))
    })
  }

  getOrgMyDueTasks(userId: string, organization: OrganizationData, page = 1, query?: any): Observable<TaskData[]> {
    return makeColdSignal<TaskData[]>(() => {
      const get = TaskModel.getOrganizationMyDueTasks(organization._id, page)
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
      return TaskFetch.getOrgsTasksMe(organization._id, _query)
        .map(Dirty.handlerMytasksApi)
        .concatMap(tasks => TaskModel.addOrganizationMyDueTasks(userId, organization, tasks, page))
    })
  }

  getOrgMyTasks(userId: string, organization: OrganizationData, page = 1, query?: any): Observable<TaskData[]> {
    return makeColdSignal<TaskData[]>(() => {
      const get = TaskModel.getOrganizationMyTasks(organization._id, page)
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
      return TaskFetch.getOrgsTasksMe(organization._id, _query)
        .map(Dirty.handlerMytasksApi)
        .concatMap(tasks => TaskModel.addOrganizationMyTasks(userId, organization, tasks, page))
    })
  }

  getOrgMyDoneTasks(userId: string, organization: OrganizationData, page = 1, query?: any): Observable<TaskData[]> {
    return makeColdSignal<TaskData[]>(() => {
      const get = TaskModel.getOrganizationMyDoneTasks(organization._id, page)
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
      return TaskFetch.getOrgsTasksMe(organization._id, _query)
        .map(Dirty.handlerMytasksApi)
        .concatMap(tasks => TaskModel.addOrganizationMyDoneTasks(userId, organization, tasks, page))
    })
  }

  getOrgMyCreatedTasks(userId: string, organization: OrganizationData, page = 1, query?: any): Observable<TaskData[]> {
    return makeColdSignal<TaskData[]>(() => {
      const get = TaskModel.getOrganizationMyCreatedTasks(organization._id, page)
      if (get) {
        return get
      }
      const maxId = TaskModel.getOrgMyCreatedMaxId(organization._id)
      const _query = { maxId, page }
      if (isObject(query)) {
        assign(_query, query)
      }
      return TaskFetch.getOrgsTasksCreated(organization._id, _query)
        .map(Dirty.handlerMytasksApi)
        .concatMap(tasks => TaskModel.addOrganizationMyCreatedTasks(userId, organization, tasks, page))
    })
  }

  getOrgMyInvolvesTasks(userId: string, organization: OrganizationData, page = 1, query?: any): Observable<TaskData[]> {
    return makeColdSignal<TaskData[]>(() => {
      const get = TaskModel.getOrgInvolvesTasks(organization._id, page)
      if (get) {
        return get
      }
      const maxId = TaskModel.getOrgMyInvolvesMaxId(organization._id)
      const _query = { page, maxId }
      if (isObject(query)) {
        assign(_query, query)
      }
      return TaskFetch.getOrgsTasksInvolves(organization._id, _query)
        .map(Dirty.handlerMytasksApi)
        .concatMap(tasks => TaskModel.addOrgMyInvolvesTasks(userId, organization, tasks, page))
    })
  }

  getProjectTasks(_projectId: string, query?: {
    page?: number
    count?: number
    fileds?: string
  }): Observable<TaskData[]> {
    return makeColdSignal<TaskData[]>(() => {
      const page = query && query.page ? query.page : 1
      const get = TaskModel.getProjectTasks(_projectId, page)
      if (get) {
        return get
      }
      return TaskFetch.getProjectTasks(_projectId, query)
        .concatMap(tasks => TaskModel.addProjectTasks(_projectId, tasks, page))
    })
  }

  getProjectDoneTasks(_projectId: string, query?: {
    page?: number
    count?: number
    fileds?: string
  }): Observable<TaskData[]> {
    return makeColdSignal<TaskData[]>(() => {
      const page = query && query.page ? query.page : 1
      const get = TaskModel.getProjectDoneTasks(_projectId, page)
      if (get) {
        return get
      }
      return TaskFetch.getProjectDoneTasks(_projectId, query)
        .concatMap(tasks => TaskModel.addProjectDoneTasks(_projectId, tasks, page))
    })
  }

  getStageTasks(stageId: string, query?: GetStageTasksOptions): Observable<TaskData[]> {
    return makeColdSignal<TaskData[]>(() => {
      const get = TaskModel.getStageTasks(stageId)
      if (get) {
        return get
      }
      return TaskFetch.getStageTasks(stageId, query)
        .concatMap(tasks => TaskModel.addStageTasks(stageId, tasks))
    })
  }

  getStageDoneTasks(stageId: string, query?: GetStageTasksOptions): Observable<TaskData[]> {
    return makeColdSignal<TaskData[]>(() => {
      const page = query && query.page || 1
      const get = TaskModel.getStageDoneTasks(stageId, page)
      if (get) {
        return get
      }
      return TaskFetch.getStageDoneTasks(stageId, query)
        .concatMap(tasks => TaskModel.addStageDoneTasks(stageId, tasks, page))
    })
  }

  get(_id: string, detailType?: detailType): Observable<TaskData> {
    return makeColdSignal<TaskData>(() => {
      const get = TaskModel.getOne(_id)
      if (get && TaskModel.checkSchema(_id)) {
        return get
      }
      return TaskFetch.get(_id, detailType)
        .concatMap(task => TaskModel.addOne(task))
    })
  }

  create(taskInfo: CreateTaskOptions): Observable<TaskData> {
    return TaskFetch.create(taskInfo)
      .concatMap(task => TaskModel.addOne(task).take(1))
  }

  fork(_taskId: string, options: ForkTaskOptions): Observable<TaskData> {
    return TaskFetch.fork(_taskId, options)
      .concatMap(task => TaskModel.addOne(task).take(1))
  }

  delete(_taskId: string): Observable<void> {
    return TaskFetch.delete(_taskId)
      .concatMap(x => TaskModel.delete(_taskId))
  }

  move(_taskId: string, options: MoveTaskOptions): Observable<TaskData> {
    return this._updateFromRequest(_taskId, TaskFetch.move(_taskId, options))
  }

  updateContent(_taskId: string, content: string): Observable<UpdateContentResponse> {
    return this._updateFromRequest(_taskId, TaskFetch.updateContent(_taskId, content))
  }

  updateDueDate(_taskId: string, dueDate: string): Observable<UpdateDueDateResponse> {
    return this._updateFromRequest(_taskId, TaskFetch.updateDueDate(_taskId, dueDate))
  }

  updateExecutor(_taskId: string, _executorId: string): Observable<UpdateExecutorResponse> {
    return this._updateFromRequest(_taskId, TaskFetch.updateExecutor(_taskId, _executorId))
  }

  updateInvolvemembers(
    _taskId: string,
    memberIds: string[],
    type: 'involveMembers' | 'addInvolvers' | 'delInvolvers'
  ): Observable<UpdateInvolveMembersResponse> {
    return this._updateFromRequest(_taskId, TaskFetch.updateInvolvemembers(_taskId, memberIds, type))
  }

  updateNote(_taskId: string, note: string): Observable<UpdateNoteResponse> {
    return this._updateFromRequest(_taskId, TaskFetch.updateNote(_taskId, note))
  }

  updateStatus(_taskId: string, status: boolean): Observable<UpdateStatusResponse> {
    return this._updateFromRequest(_taskId, TaskFetch.updateStatus(_taskId, status))
  }

  update<T extends UpdateTaskOptions>(_taskId: string, patch: T): Observable<T> {
    return this._updateFromRequest(_taskId, TaskFetch.update(_taskId, patch))
  }

  archive(taskId: string): Observable<ArchiveTaskResponse> {
    return this._updateFromRequest(taskId, TaskFetch.archive(taskId))
  }

  unarchive(taskId: string, stageId: string): Observable<ArchiveTaskResponse> {
    return this._updateFromRequest(taskId, TaskFetch.unarchive(taskId, stageId))
  }

  updateTags(taskId: string, tags: string[]): Observable<UpdateTagsResponse> {
    return this._updateFromRequest(taskId, TaskFetch.updateTags(taskId, tags))
  }

  private _updateFromRequest<T>(_taskId: string, request: Observable<T>): Observable<T> {
    return request.concatMap(r => TaskModel.update(_taskId, r))
  }
}

export default new TaskAPI
