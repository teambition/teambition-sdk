'use strict'
import BaseFetch from './base'
import Tasklist from '../schemas/Tasklist'

export interface CreateTasklistOptions {
  title: string
  _projectId: string
  description?: string
  _templateId?: string
}

export interface UpdateTasklistOptions {
  _id: string
  title?: string
  description?: string
  isArchived?: boolean
}

export class TasklistFetch extends BaseFetch {
  create(createOptions: CreateTasklistOptions): Promise<Tasklist> {
    return this.fetch.post(`tasklists`, createOptions)
  }

  get(_id: string): Promise<Tasklist> {
    return this.fetch.get(`tasklists/${_id}`)
  }

  update(_id: string, updateData: UpdateTasklistOptions): Promise<UpdateTasklistOptions> {
    return this.fetch.put(`tasklists/${_id}`, updateData)
  }

  delete(_id: string): Promise<{}> {
    return this.fetch.delete(`tasklists/${_id}`)
  }

  archive(_id: string): Promise<{
    _id: string
    _projectId: string
    isArchived: boolean
    updated: string
  }> {
    return this.fetch.post(`tasklists/${_id}/archive`)
  }

  move(_id: string): Promise<{
    _id: string
    _projectId: string
    updated: string
  }> {
    return this.fetch.put(`tasklists/${_id}/move`)
  }

  unarchive(_id: string): Promise<{
    _id: string
    _projectId: string
    isArchived: boolean
    updated: string
  }> {
    return this.fetch.delete(`tasklists/${_id}/archive`)
  }

  updateStageIds(_id: string, stageIds: string[]) {
    return this.fetch.put(`tasklists/${_id}/stageIds`, {
      stageIds: stageIds
    })
  }
}
