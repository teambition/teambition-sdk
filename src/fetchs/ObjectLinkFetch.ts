'use strict'
import { Observable } from 'rxjs/Observable'
import BaseFetch from './BaseFetch'
import { parentType, ObjectLinkData } from '../schemas/ObjectLink'
import { ObjectLinkId, DetailObjectId } from '../teambition'

export interface CreateObjectLinkOptions {
  _parentId: DetailObjectId
  parentType: parentType
  _linkedId: DetailObjectId
  linkedType: parentType
}

export class ObjectLinkFetch extends BaseFetch {
  create(options: CreateObjectLinkOptions): Observable<ObjectLinkData> {
    return this.fetch.post(`objectlinks`, options)
  }

  get(_parentId: DetailObjectId, parentType: parentType, query?: any): Observable<ObjectLinkData[]> {
    return this.fetch.get(`v2/${parentType}s/${_parentId}/objectlinks`, query)
  }

  delete(_id: ObjectLinkId): Observable<{}> {
    return this.fetch.delete(`objectlinks/${_id}`)
  }

}

export default new ObjectLinkFetch
