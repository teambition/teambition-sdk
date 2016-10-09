'use strict'
import { Observable } from 'rxjs/Observable'
import Fetch from './BaseFetch'
import Stage from '../schemas/Stage'
import Task from '../schemas/Task'

export interface StageCreateData {
  name: string
  _tasklistId: string
  _prevId: string
}

export interface StageUpdateData {
  name?: string
  isLocked?: boolean
}

export class StageFetch extends Fetch {
  create(stageData: StageCreateData): Observable<Stage> {
    return this.fetch.post(`stages`, stageData)
  }

  get(_tasklistId: string): Observable<Stage[]>

  get(_tasklistId: string, stageId: string): Observable<Stage>

  get(_tasklistId: string, stageId?: string) {
    return this.fetch.get(`tasklists/${_tasklistId}/stages${stageId ? '/' + stageId : ''}`)
  }

  update(_id: string, updateData: StageUpdateData): Observable<{
    _id: string
    name?: string
    isLocked?: boolean
  }> {
    return this.fetch.put(`stages/${_id}`, updateData)
  }

  delete(_id: string): Observable<{}> {
    return this.fetch.delete(`stages/${_id}`)
  }

  archiveTasks(_stageId: string): Observable<{
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
  }): Observable<Task[]> {
    return this.fetch.get(`stages/${_stageId}/tasks`, query)
  }

  moveTasks(stageId: string, _newStageId: string, _taskIds?: string[]): Observable<{
    _stageId: string
    updated: string
  }> {
    return this.fetch.put(`stages/${stageId}/tasks/move`, {
      _newStageId: _newStageId
    })
  }

  updateStageIds(_id: string, stageIds: string[]): Observable<{
    stageIds: string[]
  }> {
    return this.fetch.put(`tasklists/${_id}/stageIds`, {
      stageIds: stageIds
    })
  }
}

export default new StageFetch()
