'use strict'
import { Observable }  from 'rxjs/Observable'
import ObjectLinkFetch, { CreateObjectLinkOptions } from '../fetchs/ObjectLinkFetch'
import { ObjectLinkData, parentType } from '../schemas/ObjectLink'
import ObjectLinkModel from '../models/ObjectLinkModel'
import { makeColdSignal } from './utils'

export class ObjectLinkAPI {
  create(option: CreateObjectLinkOptions): Observable<ObjectLinkData> {
    return ObjectLinkFetch.create(option)
      .concatMap(r => ObjectLinkModel.addOne(r).take(1))
  }

  get(_parentId: string, parentType: parentType, querys?: any): Observable<ObjectLinkData[]> {
    return makeColdSignal<ObjectLinkData[]>(() => {
      const cache = ObjectLinkModel.getObjectLinks(_parentId)
      if (cache) {
        return cache
      }
      return ObjectLinkFetch.get(_parentId, parentType, querys)
        .concatMap(r => ObjectLinkModel.addObjectLinks(_parentId, r))
    })
  }

  delete(_id: string): Observable<void> {
    return ObjectLinkFetch.delete(_id)
      .concatMap(r => ObjectLinkModel.delete(_id))
  }
}

export default new ObjectLinkAPI
