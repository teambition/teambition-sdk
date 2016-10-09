'use strict'
import { Observable } from 'rxjs/Observable'
import BaseFetch from './BaseFetch'
import { LikeData } from '../schemas/Like'

export type ObjectType = 'task' | 'post' | 'event' | 'work'

export class LikeFetch extends BaseFetch {

  get(objectType: ObjectType, objectId: string): Observable<LikeData> {
    return this.fetch.get(`${objectType}s/${objectId}/like`, { all: '1'})
  }

  like(objectType: ObjectType, objectId: string): Observable<LikeData> {
    return this.fetch.post(`${objectType}s/${objectId}/like`)
  }

  unlike(objectType: ObjectType, objectId: string): Observable<LikeData> {
    return this.fetch.delete(`${objectType}s/${objectId}/like`)
  }
}

export default new LikeFetch()
