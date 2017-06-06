'use strict'
import { Observable } from 'rxjs/Observable'
import { ShareData } from '../schemas/Share'
import ShareModel from '../models/ShareModel'
import ShareFetch from '../fetchs/ShareFetch'
import { DetailObjectTypes, DetailObjectId, ShareId } from '../teambition'
import { makeColdSignal } from './utils'

export class ShareAPI {

  get(
    objectType: DetailObjectTypes,
    objectId: DetailObjectId,
    shareId: ShareId,
    query?: any
  ): Observable<ShareData> {
    return makeColdSignal<ShareData>(() => {
      const cache = ShareModel.getOne(shareId)
      if (cache && ShareModel.checkSchema(<string>shareId)) {
        return cache
      }
      return ShareFetch.get(objectType, objectId, shareId, query)
        .concatMap(share => ShareModel.addOne(share))
    })
  }
}

export default new ShareAPI
