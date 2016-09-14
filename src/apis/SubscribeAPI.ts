'use strict'
import { Observable } from 'rxjs/Observable'
import { Observer } from 'rxjs/Observer'
import SubscribeModel from '../models/SubscribeModel'
import SubscribeFetch, { UpdateOrgsSubscribeResponse } from '../fetchs/SubscribeFetch'
import { SubscribeData } from '../schemas/Subscribe'
import { makeColdSignal, errorHandler, observableError } from './utils'

export class SubscribeAPI {

  getOrgsSubscribe(_organizationId: string, query?: any): Observable<SubscribeData> {
    return makeColdSignal<SubscribeData>(observer => {
      const cache = SubscribeModel.getOne(_organizationId)
      if (cache) {
        return cache
      }
      return Observable.fromPromise(SubscribeFetch.getOrgsSubscribe(_organizationId, query))
        .catch(err => errorHandler(observer, err))
        .concatMap((r: SubscribeData) => SubscribeModel.addOne(_organizationId, r))
    })
  }

  updateOrgsSubscribe(_organizationId: string, $add?: string[], $del?: string[]): Observable<UpdateOrgsSubscribeResponse> {
    return Observable.create((observer: Observer<UpdateOrgsSubscribeResponse>) => {
      Observable.fromPromise(SubscribeFetch.updateOrgsSubscribe(_organizationId, $add, $del))
        .catch(err => observableError(observer, err))
        .concatMap(r => SubscribeModel.update(r._id, r))
        .forEach(r => observer.next(r))
        .then(() => observer.complete())
    })
  }
}
