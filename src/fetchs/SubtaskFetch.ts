'use strict'
import { Observable } from 'rxjs/Observable'
import Fetch from './BaseFetch'
import Task from '../schemas/Task'
import { SubtaskData } from '../schemas/Subtask'
import MySubtask from '../schemas/MySubtask'
import { OrgsTasksMeOptions } from './TaskFetch'

export interface GetMySubtasksOptions {
  count?: number
  page?: number
  hasDueDate?: string
  startDate?: string
  endDate?: string
  isCreator?: boolean
  isDone?: boolean
}

export interface SubtaskUpdateOptions {
  content?: string
  isDone?: boolean
  _executorId?: string
  dueDate?: string
}

export class SubtaskFetch extends Fetch {
  getMySubtasks(options: GetMySubtasksOptions): Observable<MySubtask[]> {
    return this.fetch.get(`v2/tasks/me/subtasks`, options)
  }

  getOrgsSubtasksMe(organizationId: string, option: OrgsTasksMeOptions): Observable<SubtaskData[]> {
    return this.fetch.get(`organizations/${organizationId}/subtasks/me`, option)
  }

  getOrgsSubtasksCreated(organizationId: string, query: {
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
    _taskId: string
    _executorId?: string
  }): Observable<SubtaskData> {
    return this.fetch.post(`subtasks`, subtaskData)
  }

  getOne(_subTaskId: string, query?: {
    _taskId?: string
    withExecutor?: boolean
  }): Observable<SubtaskData> {
    this.checkQuery(query)
    if (query.withExecutor) {
      query.withExecutor = !!query.withExecutor
    }
    return this.fetch.get(`subtasks/${_subTaskId}`, query)
  }

  getFromTask(_taskId: string, query?: any): Observable<SubtaskData[]> {
    return this.fetch.get(`tasks/${_taskId}/subtasks`, query)
  }

  update<T extends SubtaskUpdateOptions>(_subTaskId: string, subtaskData: T): Observable<T> {
    return this.fetch.put(`subtasks/${_subTaskId}`, subtaskData)
  }

  delete(_subTaskId: string): Observable<{}> {
    return this.fetch.delete(`subtasks/${_subTaskId}`)
  }

  transform(_subTaskId: string, doLink = false, doLinked = false): Observable<Task> {
    return this.fetch.put(`subtasks/${_subTaskId}/transform`, {
      doLink: doLink,
      doLinked: doLinked
    })
  }

  updateContent(_subTaskId: string, content: string): Observable<{
    _id: string
    content: string
  }> {
    return this.fetch.put(`subtasks/${_subTaskId}/content`, {
      content: content
    })
  }

  updateDuedate(_subTaskId: string, dueDate: string): Observable<{
    _id: string
    dueDate: string
  }> {
    return this.fetch.put(`subtasks/${_subTaskId}/dueDate`, {
      dueDate: dueDate
    })
  }

  updateExecutor(_subTaskId: string, _executorId: string): Observable<{
    _id: string
    _executorId: string
  }> {
    return this.fetch.put(`subtasks/${_subTaskId}/_executorId`, {
      _executorId: _executorId
    })
  }

  updateStatus(_subTaskId: string, isDone: boolean): Observable<{
    _id: string
    isDone: boolean
  }> {
    return this.fetch.put(`subtasks/${_subTaskId}/isDone`, {
      isDone: isDone
    })
  }

}

export default new SubtaskFetch()
