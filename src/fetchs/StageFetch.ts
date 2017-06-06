'use strict'
import { Observable } from 'rxjs/Observable'
import Fetch from './BaseFetch'
import Stage from '../schemas/Stage'
import Task from '../schemas/Task'
import { StageId, TasklistId, ProjectId, TaskId, UserId } from '../teambition'

export interface StageCreateData {
  name: string
  _tasklistId: TasklistId
  _prevId: StageId
}

export interface StageUpdateData {
  name?: string
  isLocked?: boolean
}

export interface GetStageTasksOptions {
  isDone?: boolean
  _executorId?: UserId
  dueDate?: string
  accomplished?: string
  all?: boolean
  limit?: number
  page?: number
}

export interface ArchiveStageTasksResponse {
  _projectId: ProjectId
  _id: StageId
  updated: string
}

export interface MoveTasksResponse {
  _stageId: StageId
  updated: string
}

export interface UpdateStageIdsResponse {
  stageIds: StageId[]
}

export class StageFetch extends Fetch {
  create(stageData: StageCreateData): Observable<Stage> {
    return this.fetch.post(`stages`, stageData)
  }

  get(_tasklistId: TasklistId): Observable<Stage[]>

  get(_tasklistId: TasklistId, stageId: StageId): Observable<Stage>

  get(_tasklistId: TasklistId, stageId?: StageId) {
    return this.fetch.get(`tasklists/${_tasklistId}/stages${stageId ? '/' + stageId : ''}`)
  }

  update(_id: StageId, updateData: StageUpdateData): Observable<{
    _id: string
    name?: string
    isLocked?: boolean
  }> {
    return this.fetch.put(`stages/${_id}`, updateData)
  }

  delete(_id: StageId): Observable<void> {
    return this.fetch.delete(`stages/${_id}`)
  }

  archiveTasks(_stageId: StageId): Observable<ArchiveStageTasksResponse> {
    return this.fetch.put(`stages/${_stageId}/tasks/archive`)
  }

  getTasks(_stageId: StageId, query?: GetStageTasksOptions): Observable<Task[]> {
    return this.fetch.get(`stages/${_stageId}/tasks`, query)
  }

  moveTasks(stageId: StageId, _newStageId: StageId, _taskIds?: TaskId[]): Observable<MoveTasksResponse> {
    return this.fetch.put(`stages/${stageId}/tasks/move`, {
      _newStageId: _newStageId
    })
  }

  updateStageIds(_id: TasklistId, stageIds: StageId[]): Observable<UpdateStageIdsResponse> {
    return this.fetch.put(`tasklists/${_id}/stageIds`, {
      stageIds: stageIds
    })
  }
}

export default new StageFetch
