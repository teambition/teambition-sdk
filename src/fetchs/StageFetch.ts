'use strict'
import Fetch from './base'
import Stage from '../schemas/Stage'
import Task from '../schemas/Task'

class StageFetch extends Fetch {
  create(stageData: {
    name: string
    _tasklistId: string
    _prevId: string
  }): Promise<Stage> {
    return this.fetch.post(`stages`, stageData)
  }

  get(_tasklistId: string): Promise<Stage[]>

  get(_tasklistId: string, stageId: string): Promise<Stage>

  get(_tasklistId: string, stageId?: string) {
    return this.fetch.get(`tasklists/${_tasklistId}/stages/${stageId}`)
  }

  update(_id: string, updateData: {
    name?: string
    isLocked?: boolean
  }): Promise<{
    _id: string
    name?: string
    isLocked?: boolean
  }> {
    return this.fetch.put(`stages/${_id}`, updateData)
  }

  delete(_id: string): Promise<{}> {
    return this.fetch.delete(`stages/${_id}`)
  }

  archiveTasks(_stageId: string): Promise<{
    _projectId: string
    _id: string
    updated: string
  }> {
    return this.fetch.put(`stages/${_stageId}/tasks/archive`)
  }

  getTasks(_stageId: string, query?: {
    isDone?: boolean
    _executorId?: string
    dueDate?: string
    accomplished?: string
    all?: boolean
    limit?: number
    page?: number
  }): Promise<Task[]> {
    return this.fetch.get(`stages/${_stageId}/tasks`, query)
  }

  moveTasks(stageId: string, _newStageId: string, _taskIds?: string[]): Promise<{
    _stageId: string
    updated: string
  }> {
    return this.fetch.put(`stages/${stageId}/tasks/move`, {
      _newStageId: _newStageId
    })
  }

}
