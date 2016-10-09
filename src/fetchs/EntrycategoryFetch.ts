'use strict'
import { Observable } from 'rxjs/Observable'
import BaseFetch from './BaseFetch'
import { EntrycategoryData } from '../schemas/Entrycategory'

export interface CreateEntrycategoryOptions {
  _projectId: string
  title: string
  type: number
}

export interface UpdateEntrycategoryOptions {
  title: string
}

export interface UpdateEntrycategoryResponse {
  _id: string
  updated: string
  title: string
}

export class EntrycategoryFetch extends BaseFetch {
  create(entrycategory: CreateEntrycategoryOptions): Observable<EntrycategoryData> {
    return this.fetch.post(`entrycategories`, entrycategory)
  }

  get(_entrycategoryId: string, query: {
    _projectId: string
  }): Observable<EntrycategoryData> {
    return this.fetch.get(`entrycategories/${_entrycategoryId}`, query)
  }

  getEntrycategories(query: {
    _projectId: string
    page?: number
    count?: number
  }): Observable<EntrycategoryData[]> {
    return this.fetch.get(`entrycategories`, query)
  }

  update(_entrycategoryId: string, entrycategory: UpdateEntrycategoryOptions): Observable<any> {
    return this.fetch.put(`entrycategories/${_entrycategoryId}`, entrycategory)
  }

  delete(_entrycategoryId: string): Observable<void> {
    return this.fetch.delete<void>(`entrycategories/${_entrycategoryId}`)
  }
}

export default new EntrycategoryFetch()
