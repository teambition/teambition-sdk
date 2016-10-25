'use strict'
import { Observable } from 'rxjs/Observable'
import BaseFetch from './BaseFetch'
import { EntrycategoryData } from '../schemas/Entrycategory'
import { EntryCategoryId, ProjectId } from '../teambition'

export interface CreateEntrycategoryOptions {
  _projectId: ProjectId
  title: string
  type: number
}

export interface UpdateEntrycategoryOptions {
  title: string
}

export interface UpdateEntrycategoryResponse {
  _id: EntryCategoryId
  updated: string
  title: string
}

export class EntrycategoryFetch extends BaseFetch {
  create(entrycategory: CreateEntrycategoryOptions): Observable<EntrycategoryData> {
    return this.fetch.post(`entrycategories`, entrycategory)
  }

  get(_entrycategoryId: EntryCategoryId, query: {
    _projectId: ProjectId
  }): Observable<EntrycategoryData> {
    return this.fetch.get(`entrycategories/${_entrycategoryId}`, query)
  }

  getEntrycategories(query: {
    _projectId: ProjectId
    page?: number
    count?: number
  }): Observable<EntrycategoryData[]> {
    return this.fetch.get(`entrycategories`, query)
  }

  update(_entrycategoryId: EntryCategoryId, entrycategory: UpdateEntrycategoryOptions): Observable<any> {
    return this.fetch.put(`entrycategories/${_entrycategoryId}`, entrycategory)
  }

  delete(_entrycategoryId: EntryCategoryId): Observable<void> {
    return this.fetch.delete<void>(`entrycategories/${_entrycategoryId}`)
  }
}

export default new EntrycategoryFetch
