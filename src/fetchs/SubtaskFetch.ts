'use strict'
import Fetch from './base'
import Task from '../schemas/Task'
import Subtask from '../schemas/Subtask'
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
  getMySubtasks(options: GetMySubtasksOptions): Promise<MySubtask[]> {
    return this.fetch.get(`v2/tasks/me/subtasks`, options)
  }

  getOrgsSubtasksMe(organizationId: string, option: OrgsTasksMeOptions): Promise<Task[]> {
    return this.fetch.get(`organizations/${organizationId}/subtasks/me`, option)
  }

  create(subtaskData: {
    content: string
    _taskId: string
    _executorId?: string
  }): Promise<Subtask> {
    return this.fetch.post(`subtasks`, subtaskData)
  }

  get(_subTaskId: string, _taskId?: string, withExecutor?: boolean): Promise<Subtask> {
    let queryData: {
      _taskId?: string
      withExecutor?: boolean
    }
    if (_taskId && withExecutor) {
      queryData = {}
      if (_taskId) {
        queryData._taskId = _taskId
      }
      queryData.withExecutor = !!withExecutor
    }
    return this.fetch.get(`subtasks/${_subTaskId}`, queryData)
  }

  getFromTask(_taskId: string): Promise<Subtask[]> {
    return this.fetch.get(`tasks/${_taskId}/subtasks`)
  }

  update<T extends SubtaskUpdateOptions>(_subTaskId: string, subtaskData: T): Promise<T> {
    return this.fetch.put(`subtasks/${_subTaskId}`, subtaskData)
  }

  delete(_subTaskId: string): Promise<{}> {
    return this.fetch.delete(`subtasks/${_subTaskId}`)
  }

  transform(_subTaskId: string, doLink = false, doLinked = false): Promise<Task> {
    return this.fetch.put(`subtasks/${_subTaskId}/transform`, {
      doLink: doLink,
      doLinked: doLinked
    })
  }

  updateContent(_subTaskId: string, content: string): Promise<{
    _id: string
    content: string
  }> {
    return this.fetch.put(`subtasks/${_subTaskId}/content`, {
      content: content
    })
  }

  updateDuedate(_subTaskId: string, dueDate: string): Promise<{
    _id: string
    dueDate: string
  }> {
    return this.fetch.put(`subtasks/${_subTaskId}/dueDate`, {
      dueDate: dueDate
    })
  }

  updateExecutor(_subTaskId: string, _executorId: string): Promise<{
    _id: string
    _executorId: string
  }> {
    return this.fetch.put(`subtasks/${_subTaskId}/_executorId`, {
      _executorId: _executorId
    })
  }

  updateStatus(_subTaskId: string, isDone: boolean): Promise<{
    _id: string
    isDone: boolean
  }> {
    return this.fetch.put(`subtasks/${_subTaskId}/isDone`, {
      isDone: isDone
    })
  }

}
