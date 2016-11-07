'use strict'
import { Observable }  from 'rxjs/Observable'
import ObjectLinkFetch, { CreateObjectLinkOptions } from '../fetchs/ObjectLinkFetch'
import { ObjectLinkData, parentType } from '../schemas/ObjectLink'
import ObjectLinkModel from '../models/ObjectLinkModel'
import { makeColdSignal } from './utils'
import { ObjectLinkId, DetailObjectId } from '../teambition'

export class ObjectLinkAPI {
  create(option: CreateObjectLinkOptions): Observable<ObjectLinkData> {
    return ObjectLinkFetch.create(option)
      .concatMap(r =>
        ObjectLinkModel.addOne(r)
          .take(1)
      )
  }

  get(_parentId: DetailObjectId, parentType: parentType, querys?: any): Observable<ObjectLinkData[]> {
    return makeColdSignal<ObjectLinkData[]>(() => {
      const cache = ObjectLinkModel.getObjectLinks(_parentId)
      if (cache) {
        return cache
      }
      return ObjectLinkFetch.get(_parentId, parentType, querys)
        .concatMap(r =>
          ObjectLinkModel.addObjectLinks(_parentId, r)
        )
    })
  }

  delete(_id: ObjectLinkId): Observable<void> {
    return ObjectLinkFetch.delete(_id)
      .concatMap(r =>
        ObjectLinkModel.delete(<string>_id)
      )
  }
}

export default new ObjectLinkAPI
