'use strict'
import { Observable } from 'rxjs/Observable'
import BaseFetch from './BaseFetch'
import { LikeData } from '../schemas/Like'
import { DetailObjectType, DetailObjectId } from '../teambition'

export class LikeFetch extends BaseFetch {

  get(objectType: DetailObjectType, objectId: DetailObjectId): Observable<LikeData> {
    const fetchNamespace = objectType !== 'entry' ? `${objectType}s` : 'entries'
    return this.fetch.get(`${fetchNamespace}/${objectId}/like`, { all: '1'})
  }

  like(objectType: DetailObjectType, objectId: DetailObjectId): Observable<LikeData> {
    const fetchNamespace = objectType !== 'entry' ? `${objectType}s` : 'entries'
    return this.fetch.post(`${fetchNamespace}/${objectId}/like`)
  }

  unlike(objectType: DetailObjectType, objectId: DetailObjectId): Observable<LikeData> {
    const fetchNamespace = objectType !== 'entry' ? `${objectType}s` : 'entries'
    return this.fetch.delete(`${fetchNamespace}/${objectId}/like`)
  }
}

export default new LikeFetch
