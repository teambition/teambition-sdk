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
import { ProjectId, EntryCategoryId } from '../teambition'

export class EntrycategoryAPI {
  getEntrycategories(query: {
    _projectId: ProjectId
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

  update(_entrycategoryId: EntryCategoryId, data: UpdateEntrycategoryOptions): Observable<UpdateEntrycategoryResponse> {
    return EntrycategoryFetch.update(_entrycategoryId, data)
      .concatMap(entrycategory => EntrycategoryModel.update(<string>_entrycategoryId, entrycategory))
  }

  get(_entrycategoryId: EntryCategoryId, query: {
    _projectId: ProjectId
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

  delete(entrycategoryId: EntryCategoryId): Observable<void> {
    return EntrycategoryFetch.delete(entrycategoryId)
      .concatMap(x => EntrycategoryModel.delete(<string>entrycategoryId))
  }

}

export default new EntrycategoryAPI
