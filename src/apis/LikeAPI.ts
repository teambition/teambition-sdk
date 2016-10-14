'use strict'
import { Observable } from 'rxjs/Observable'
import LikeFetch, { ObjectType } from '../fetchs/LikeFetch'
import LikeModel from '../models/LikeModel'
import { LikeData } from '../schemas/Like'
import { makeColdSignal } from './utils'

export class LikeAPI {

  getLike(objectType: ObjectType, objectId: string): Observable<LikeData> {
    return makeColdSignal<LikeData>(() => {
      const cache = LikeModel.get(`${objectId}:like`)
      if (cache) {
        return cache
      }
      return LikeFetch.get(objectType, objectId)
        .concatMap(r => {
          r._boundToObjectId = objectId
          r._boundToObjectType = objectType
          r._id = `${objectId}:like`
          return LikeModel.storeOne(`${objectId}:like`, r)
        })
    })
  }

  like(objectType: ObjectType, objectId: string): Observable<LikeData> {
    return LikeFetch.like(objectType, objectId)
      .concatMap(r => LikeModel.update(`${objectId}:like`, r))
  }

  unlike(objectType: ObjectType, objectId: string): Observable<LikeData> {
    return LikeFetch.unlike(objectType, objectId)
      .concatMap(r => LikeModel.update(`${objectId}:like`, r))
  }
}

export default new LikeAPI
