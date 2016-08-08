'use strict'
import { Observable } from 'rxjs/Observable'
import { Observer } from 'rxjs/Observer'
import { EntrycategoryData } from '../schemas/Entrycategory'
import EntrycategoryModel from '../models/EntrycategoryModel'
import {
  default as EntrycategoryFetch,
  CreateEntrycategoryOptions,
  UpdateEntrycategoryOptions,
  UpdateEntrycategoryResponse
} from '../fetchs/EntrycategoryFetch'
import { makeColdSignal, observableError, errorHandler } from './utils'

export class EntrycategoryAPI {
  constructor() {
    EntrycategoryModel.destructor()
  }

  getEntrycategories(query: {
    _projectId: string
    page?: number
    count?: number
  }): Observable<EntrycategoryData[]> {
    return makeColdSignal<EntrycategoryData[]>(observer => {
      const page = query && query.page ? query.page : 1
      const get = EntrycategoryModel.getEntrycategories(query._projectId, page)
      if (get) {
        return get
      }
      return Observable.fromPromise(EntrycategoryFetch.getEntrycategories(query))
        .catch(err => errorHandler(observer, err))
        .concatMap(posts => EntrycategoryModel.addEntrycategories(query._projectId, posts, page))
    })
  }

  create(entrycategory: CreateEntrycategoryOptions): Observable<EntrycategoryData> {
    return Observable.create((observer: Observer<EntrycategoryData>) => {
      return Observable.fromPromise(EntrycategoryFetch.create(entrycategory))
        .catch(err => observableError(observer, err))
        .concatMap(entrycategory => EntrycategoryModel.addOne(entrycategory).take(1))
        .forEach(r => observer.next(r))
        .then(() => observer.complete())
    })
  }

  update(_entrycategoryId: string, data: UpdateEntrycategoryOptions): Observable<UpdateEntrycategoryResponse> {
    return Observable.create((observer: Observer<UpdateEntrycategoryResponse>) => {
      return Observable.fromPromise(EntrycategoryFetch.update(_entrycategoryId, data))
        .concatMap(entrycategory => EntrycategoryModel.update(_entrycategoryId, entrycategory))
        .forEach(entrycategory => observer.next(entrycategory))
        .then(x => observer.complete())
    })
  }

  get(_entrycategoryId: string, query: {
    _projectId: string
  }): Observable<EntrycategoryData> {
    return makeColdSignal<EntrycategoryData>(observer => {
      const get = EntrycategoryModel.getOne(_entrycategoryId)
      if (get) {
        return get
      }
      return Observable.fromPromise(EntrycategoryFetch.get(_entrycategoryId, query))
        .catch(err => errorHandler(observer, err))
        .concatMap(post => EntrycategoryModel.addOne(post))
    })
  }

  /**
   * cold signal
   */
  delete(entrycategoryId: string): Observable<EntrycategoryData> {
    return Observable.create((observer: Observer<void>) => {
      Observable.fromPromise(EntrycategoryFetch.delete(entrycategoryId))
        .catch(err => observableError(observer, err))
        .concatMap(x => EntrycategoryModel.delete(entrycategoryId))
        .forEach(x => observer.next(null))
        .then(x => observer.complete())
    })
  }

}
