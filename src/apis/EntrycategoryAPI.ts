'use strict'
import { Observable } from 'rxjs/Observable'
import { EntrycategoryData } from '../schemas/Entrycategory'
import EntrycategoryModel from '../models/EntrycategoryModel'
import {
  default as EntrycategoryFetch,
  CreateEntrycategoryOptions,
  UpdateEntrycategoryOptions,
  UpdateEntrycategoryResponse
} from '../fetchs/EntrycategoryFetch'
import { makeColdSignal } from './utils'

export class EntrycategoryAPI {
  getEntrycategories(query: {
    _projectId: string
    page?: number
    count?: number
  }): Observable<EntrycategoryData[]> {
    return makeColdSignal<EntrycategoryData[]>(() => {
      const page = query && query.page ? query.page : 1
      const get = EntrycategoryModel.getEntrycategories(query._projectId, page)
      if (get) {
        return get
      }
      return EntrycategoryFetch.getEntrycategories(query)
        .concatMap(posts => EntrycategoryModel.addEntrycategories(query._projectId, posts, page))
    })
  }

  create(entrycategory: CreateEntrycategoryOptions): Observable<EntrycategoryData> {
    return EntrycategoryFetch.create(entrycategory)
      .concatMap(entrycategory => EntrycategoryModel.addOne(entrycategory).take(1))
  }

  update(_entrycategoryId: string, data: UpdateEntrycategoryOptions): Observable<UpdateEntrycategoryResponse> {
    return EntrycategoryFetch.update(_entrycategoryId, data)
      .concatMap(entrycategory => EntrycategoryModel.update(_entrycategoryId, entrycategory))
  }

  get(_entrycategoryId: string, query: {
    _projectId: string
  }): Observable<EntrycategoryData> {
    return makeColdSignal<EntrycategoryData>(() => {
      const get = EntrycategoryModel.getOne(_entrycategoryId)
      if (get) {
        return get
      }
      return EntrycategoryFetch.get(_entrycategoryId, query)
        .concatMap(post => EntrycategoryModel.addOne(post))
    })
  }

  delete(entrycategoryId: string): Observable<void> {
    return EntrycategoryFetch.delete(entrycategoryId)
      .concatMap(x => EntrycategoryModel.delete(entrycategoryId))
  }

}

export default new EntrycategoryAPI
