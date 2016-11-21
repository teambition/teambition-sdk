'use strict'
import { Observable } from 'rxjs/Observable'
import Fetch from './BaseFetch'
import { TaskData } from '../schemas/Task'
import { SubtaskData } from '../schemas/Subtask'
import MySubtask from '../schemas/MySubtask'
import { OrgsTasksMeOptions } from './TaskFetch'
import {
  TaskId,
  SubtaskId,
  OrganizationId,
  UserId
} from '../teambition'

export interface GetMySubtasksOptions {
  count?: number
  page?: number
  hasDueDate?: boolean
  startDate?: string
  endDate?: string
  isCreator?: boolean
  isDone?: boolean
}

export interface SubtaskUpdateOptions {
  content?: string
  isDone?: boolean
  _executorId?: UserId
  dueDate?: string
}

export interface UpdateSubtaskDuedateResponse {
  _id: SubtaskId
  dueDate: string
  updated: string
}

export interface UpdateSubtaskContentResponse {
  _id: SubtaskId
  content: string
  updated: string
}

export interface UpdateSubtaskExecutorResponse {
  _id: SubtaskId
  _executorId: UserId
  updated: string
}

export interface UpdateSubtaskStatusResponse {
  _id: SubtaskId
  isDone: boolean
  updated: string
}

export class SubtaskFetch extends Fetch {
  getMySubtasks(options: GetMySubtasksOptions): Observable<MySubtask[]> {
    return this.fetch.get(`v2/tasks/me/subtasks`, options)
  }

  getOrgsSubtasksMe(
    organizationId: OrganizationId,
    option: OrgsTasksMeOptions
  ): Observable<SubtaskData[]> {
    return this.fetch.get(`organizations/${organizationId}/subtasks/me`, option)
  }

  getOrgsSubtasksCreated(organizationId: OrganizationId, query: {
    page: number,
    maxId?: number
  } = {
    page: 1
  }): Observable<SubtaskData[]> {
    const _query = this.checkQuery(query)
    return this.fetch.get(`organizations/${organizationId}/subtasks/me/created`, query)
  }

  create(subtaskData: {
    content: string
    _taskId: TaskId
    _executorId?: UserId
  }): Observable<SubtaskData> {
    return this.fetch.post(`subtasks`, subtaskData)
  }

  getOne(_subTaskId: SubtaskId, query?: {
    _taskId?: TaskId
    withExecutor?: boolean
  }): Observable<SubtaskData> {
    this.checkQuery(query)
    if (query.withExecutor) {
      query.withExecutor = !!query.withExecutor
    }
    return this.fetch.get(`subtasks/${_subTaskId}`, query)
  }

  getFromTask(_taskId: TaskId, query?: any): Observable<SubtaskData[]> {
    return this.fetch.get(`tasks/${_taskId}/subtasks`, query)
  }

  update<T extends SubtaskUpdateOptions>(_subTaskId: SubtaskId, subtaskData: T): Observable<T> {
    return this.fetch.put(`subtasks/${_subTaskId}`, subtaskData)
  }

  delete(_subTaskId: SubtaskId): Observable<{}> {
    return this.fetch.delete(`subtasks/${_subTaskId}`)
  }

  transform(_subTaskId: SubtaskId, doLink = false, doLinked = false): Observable<TaskData> {
    return this.fetch.put(`subtasks/${_subTaskId}/transform`, {
      doLink: doLink,
      doLinked: doLinked
    })
  }

  updateContent(_subTaskId: SubtaskId, content: string): Observable<UpdateSubtaskContentResponse> {
    return this.fetch.put(`subtasks/${_subTaskId}/content`, {
      content: content
    })
  }

  updateDuedate(_subTaskId: SubtaskId, dueDate: string): Observable<UpdateSubtaskDuedateResponse> {
    return this.fetch.put(`subtasks/${_subTaskId}/dueDate`, {
      dueDate: dueDate
    })
  }

  updateExecutor(_subTaskId: SubtaskId, _executorId: UserId): Observable<UpdateSubtaskExecutorResponse> {
    return this.fetch.put(`subtasks/${_subTaskId}/_executorId`, {
      _executorId: _executorId
    })
  }

  updateStatus(_subTaskId: SubtaskId, isDone: boolean): Observable<UpdateSubtaskStatusResponse> {
    return this.fetch.put(`subtasks/${_subTaskId}/isDone`, {
      isDone: isDone
    })
  }

}

export default new SubtaskFetch
