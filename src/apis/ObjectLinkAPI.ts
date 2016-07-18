'use strict'
import { Observable }  from 'rxjs/Observable'
import { Observer } from 'rxjs/Observer'
import ObjectLinkFetch, { CreateObjectLinkOptions } from '../fetchs/ObjectLinkFetch'
import { ObjectLinkData, parentType } from '../schemas/ObjectLink'
import ObjectLinkModel from '../models/ObjectLinkModel'
import { makeColdSignal, errorHandler, observableError } from './utils'

export class ObjectLinkAPI {
  create(option: CreateObjectLinkOptions): Observable<ObjectLinkData> {
    return Observable.create((observer: Observer<ObjectLinkData>) => {
      Observable.fromPromise(ObjectLinkFetch.create(option))
        .catch(err => observableError(observer, err))
        .concatMap(r => ObjectLinkModel.addOne(r))
        .forEach(r => observer.next(r))
        .then(() => observer.complete())
    })
  }

  get(_parentId: string, parentType: parentType, querys?: any): Observable<ObjectLinkData[]> {
    return makeColdSignal<ObjectLinkData[]>(observer => {
      const cache = ObjectLinkModel.getObjectLinks(_parentId)
      if (cache) {
        return cache
      }
      return Observable.fromPromise(ObjectLinkFetch.get(_parentId, parentType, querys))
        .catch(err => errorHandler(observer, err))
        .concatMap(r => ObjectLinkModel.addObjectLinks(_parentId, r))
    })
  }

  delete(_id: string): Observable<void> {
    return Observable.create((observer: Observer<void>) => {
      Observable.fromPromise(ObjectLinkFetch.delete(_id))
        .catch(err => observableError(observer, err))
        .concatMap(r => ObjectLinkModel.delete(_id))
        .forEach(() => observer.next(null))
        .then(() => observer.complete())
    })
  }
}
