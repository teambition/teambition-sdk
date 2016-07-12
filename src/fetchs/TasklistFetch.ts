'use strict'
import BaseFetch from './BaseFetch'
import { TasklistData } from '../schemas/Tasklist'

export interface CreateTasklistOptions {
  title: string
  _projectId: string
  description?: string
  _templateId?: string
}

export interface UpdateTasklistOptions {
  title?: string
  description?: string
  isArchived?: boolean
}

export interface ArchiveTasklistResponse {
  _id: string
  _projectId: string
  isArchived: boolean
  updated: string
}

export interface UnarchiveTasklistResponse {
  _id: string
  _projectId: string
  isArchived: boolean
  updated: string
}

export class TasklistFetch extends BaseFetch {
  create(createOptions: CreateTasklistOptions): Promise<TasklistData> {
    return this.fetch.post(`tasklists`, createOptions)
  }

  getTasklists(_projectId: string, query?: any): Promise<TasklistData[]> {
    return this.fetch.get(`projects/${_projectId}/tasklists`, query)
  }

  get(_id: string, query?: any): Promise<TasklistData> {
    return this.fetch.get(`tasklists/${_id}`, query)
  }

  update(_id: string, updateData: UpdateTasklistOptions): Promise<UpdateTasklistOptions> {
    return this.fetch.put(`tasklists/${_id}`, updateData)
  }

  delete(_id: string): Promise<{}> {
    return this.fetch.delete(`tasklists/${_id}`)
  }

  archive(_id: string): Promise<ArchiveTasklistResponse> {
    return this.fetch.post(`tasklists/${_id}/archive`)
  }

  move(_id: string): Promise<{
    _id: string
    _projectId: string
    updated: string
  }> {
    return this.fetch.put(`tasklists/${_id}/move`)
  }

  unarchive(_id: string): Promise<UnarchiveTasklistResponse> {
    return this.fetch.delete(`tasklists/${_id}/archive`)
  }
}

export default new TasklistFetch()
