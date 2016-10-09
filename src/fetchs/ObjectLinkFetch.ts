'use strict'
import { Observable } from 'rxjs/Observable'
import BaseFetch from './BaseFetch'
import { parentType, ObjectLinkData } from '../schemas/ObjectLink'

export interface CreateObjectLinkOptions {
  _parentId: string
  parentType: parentType
  _linkedId: string
  linkedType: string
}

export class ObjectLinkFetch extends BaseFetch {
  create(options: CreateObjectLinkOptions): Observable<ObjectLinkData> {
    return this.fetch.post(`objectlinks`, options)
  }

  get(_parentId: string, parentType: parentType, query?: any): Observable<ObjectLinkData[]> {
    return this.fetch.get(`v2/${parentType}s/${_parentId}/objectlinks`, query)
  }

  delete(_id: string): Observable<{}> {
    return this.fetch.delete(`objectlinks/${_id}`)
  }

}

export default new ObjectLinkFetch()
