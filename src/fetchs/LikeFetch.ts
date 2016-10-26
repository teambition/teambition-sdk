'use strict'
import { Observable } from 'rxjs/Observable'
import BaseFetch from './BaseFetch'
import { LikeData } from '../schemas/Like'
import { DetailObjectType, DetailObjectId } from '../teambition'

export class LikeFetch extends BaseFetch {

  get(objectType: DetailObjectType, objectId: DetailObjectId): Observable<LikeData> {
    return this.fetch.get(`${objectType}s/${objectId}/like`, { all: '1'})
  }

  like(objectType: DetailObjectType, objectId: DetailObjectId): Observable<LikeData> {
    return this.fetch.post(`${objectType}s/${objectId}/like`)
  }

  unlike(objectType: DetailObjectType, objectId: DetailObjectId): Observable<LikeData> {
    return this.fetch.delete(`${objectType}s/${objectId}/like`)
  }
}

export default new LikeFetch
