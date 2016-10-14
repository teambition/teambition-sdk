'use strict'
import { Observable } from 'rxjs/Observable'
import SubscribeModel from '../models/SubscribeModel'
import SubscribeFetch, { UpdateOrgsSubscribeResponse } from '../fetchs/SubscribeFetch'
import { SubscribeData } from '../schemas/Subscribe'
import { makeColdSignal } from './utils'

export class SubscribeAPI {

  getOrgsSubscribe(_organizationId: string, query?: any): Observable<SubscribeData> {
    return makeColdSignal<SubscribeData>(() => {
      const cache = SubscribeModel.getOne(_organizationId)
      if (cache) {
        return cache
      }
      return SubscribeFetch.getOrgsSubscribe(_organizationId, query)
        .concatMap(r => SubscribeModel.addOne(_organizationId, r))
    })
  }

  updateOrgsSubscribe(_organizationId: string, $add?: string[], $del?: string[]): Observable<UpdateOrgsSubscribeResponse> {
    return SubscribeFetch.updateOrgsSubscribe(_organizationId, $add, $del)
      .concatMap(r => SubscribeModel.update(r._id, r))
  }
}

export default new SubscribeAPI
