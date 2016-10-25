'use strict'
import { Observable } from 'rxjs/Observable'
import SubscribeModel from '../models/SubscribeModel'
import SubscribeFetch, { UpdateOrgsSubscribeResponse } from '../fetchs/SubscribeFetch'
import { SubscribeData } from '../schemas/Subscribe'
import { makeColdSignal } from './utils'
import { OrganizationId, ProjectId } from '../teambition'

export class SubscribeAPI {

  getOrgsSubscribe(_organizationId: OrganizationId, query?: any): Observable<SubscribeData> {
    return makeColdSignal<SubscribeData>(() => {
      const cache = SubscribeModel.getOne(_organizationId)
      if (cache) {
        return cache
      }
      return SubscribeFetch.getOrgsSubscribe(_organizationId, query)
        .concatMap(r => SubscribeModel.addOne(_organizationId, r))
    })
  }

  updateOrgsSubscribe(
    _organizationId: OrganizationId,
    $add?: ProjectId[],
    $del?: ProjectId[]
  ): Observable<UpdateOrgsSubscribeResponse> {
    return SubscribeFetch.updateOrgsSubscribe(_organizationId, $add, $del)
      .concatMap(r => SubscribeModel.update(<string>r._id, r))
  }
}

export default new SubscribeAPI
