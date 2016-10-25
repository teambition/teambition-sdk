'use strict'
import { Observable } from 'rxjs/Observable'
import BaseFetch from './BaseFetch'
import { TasklistData } from '../schemas/Tasklist'
import { TasklistId, ProjectId } from '../teambition'

export interface CreateTasklistOptions {
  title: string
  _projectId: ProjectId
  description?: string
  _templateId?: string
}

export interface UpdateTasklistOptions {
  title?: string
  description?: string
  isArchived?: boolean
}

export interface ArchiveTasklistResponse {
  _id: TasklistId
  _projectId: ProjectId
  isArchived: boolean
  updated: string
}

export interface MoveTasklistResponse {
  _id: TasklistId
  _projectId: ProjectId
  updated: string
}

export interface UnarchiveTasklistResponse {
  _id: TasklistId
  _projectId: ProjectId
  isArchived: boolean
  updated: string
}

export class TasklistFetch extends BaseFetch {
  create(createOptions: CreateTasklistOptions): Observable<TasklistData> {
    return this.fetch.post(`tasklists`, createOptions)
  }

  getTasklists(_projectId: ProjectId, query?: any): Observable<TasklistData[]> {
    return this.fetch.get(`projects/${_projectId}/tasklists`, query)
  }

  get(_id: TasklistId, query?: any): Observable<TasklistData> {
    return this.fetch.get(`tasklists/${_id}`, query)
  }

  update(_id: TasklistId, updateData: UpdateTasklistOptions): Observable<UpdateTasklistOptions> {
    return this.fetch.put(`tasklists/${_id}`, updateData)
  }

  delete(_id: TasklistId): Observable<{}> {
    return this.fetch.delete(`tasklists/${_id}`)
  }

  archive(_id: TasklistId): Observable<ArchiveTasklistResponse> {
    return this.fetch.post(`tasklists/${_id}/archive`)
  }

  move(_id: TasklistId): Observable<MoveTasklistResponse> {
    return this.fetch.put(`tasklists/${_id}/move`)
  }

  unarchive(_id: TasklistId): Observable<UnarchiveTasklistResponse> {
    return this.fetch.delete(`tasklists/${_id}/archive`)
  }
}

export default new TasklistFetch
