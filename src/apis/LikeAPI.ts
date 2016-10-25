'use strict'
import { Observable } from 'rxjs/Observable'
import LikeFetch from '../fetchs/LikeFetch'
import LikeModel from '../models/LikeModel'
import { LikeData } from '../schemas/Like'
import { makeColdSignal } from './utils'
import { DetailObjectType, DetailObjectId } from '../teambition'

export class LikeAPI {

  getLike(objectType: DetailObjectType, objectId: DetailObjectId): Observable<LikeData> {
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

  like(objectType: DetailObjectType, objectId: DetailObjectId): Observable<LikeData> {
    return LikeFetch.like(objectType, objectId)
      .concatMap(r => LikeModel.update(`${objectId}:like`, r))
  }

  unlike(objectType: DetailObjectType, objectId: DetailObjectId): Observable<LikeData> {
    return LikeFetch.unlike(objectType, objectId)
      .concatMap(r => LikeModel.update(`${objectId}:like`, r))
  }
}

export default new LikeAPI
