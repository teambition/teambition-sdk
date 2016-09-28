'use strict'
import { Observable } from 'rxjs/Observable'
import { Observer } from 'rxjs/Observer'
import LikeFetch, { ObjectType } from '../fetchs/LikeFetch'
import LikeModel from '../models/LikeModel'
import { LikeData } from '../schemas/Like'
import { observableError, makeColdSignal, errorHandler } from './utils'

export class LikeAPI {

  getLike(objectType: ObjectType, objectId: string): Observable<LikeData> {
    return makeColdSignal<LikeData>(observer => {
      const cache = LikeModel.get(`${objectId}:like`)
      if (cache) {
        return cache
      }
      return Observable.fromPromise(LikeFetch.get(objectType, objectId))
        ._catch((err: any) => errorHandler(observer, err))
        .concatMap(r => {
          r._boundToObjectId = objectId
          r._boundToObjectType = objectType
          r._id = `${objectId}:like`
          return LikeModel.storeOne(`${objectId}:like`, r)
        })
    })
  }

  like(objectType: ObjectType, objectId: string): Observable<LikeData> {
    return Observable.create((observer: Observer<LikeData>) => {
      Observable.fromPromise(LikeFetch.like(objectType, objectId))
        ._catch((err: any) => observableError(observer, err))
        .concatMap(r => LikeModel.update(`${objectId}:like`, r))
        .forEach(r => observer.next(r))
        .then(() => observer.complete())
    })
  }

  unlike(objectType: ObjectType, objectId: string): Observable<LikeData> {
    return Observable.create((observer: Observer<LikeData>) => {
      Observable.fromPromise(LikeFetch.unlike(objectType, objectId))
        ._catch((err: any) => observableError(observer, err))
        .concatMap(r => LikeModel.update(`${objectId}:like`, r))
        .forEach(r => observer.next(r))
        .then(() => observer.complete())
    })
  }
}
