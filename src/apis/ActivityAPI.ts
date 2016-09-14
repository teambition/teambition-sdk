'use strict'
import 'rxjs/add/observable/fromPromise'
import 'rxjs/add/operator/catch'
import 'rxjs/add/operator/concatMap'
import 'rxjs/add/operator/take'
import { Observer } from 'rxjs/Observer'
import { Observable } from 'rxjs/Observable'
import ActivityModel from '../models/ActivityModel'
import { ActivityData } from '../schemas/Activity'
import { ActivitySaveData, default as ActivityFetch } from '../fetchs/ActivityFetch'
import { makeColdSignal, errorHandler, observableError } from './utils'

export interface GetActivitiesOptions {
  lang?: string
  fields?: string
  count: number
  page: number
}

export class ActivityAPI {

  getActivities(_boundToObjectType: string, _boundToObjectId: string, query?: GetActivitiesOptions): Observable<ActivityData[]> {
    return makeColdSignal<ActivityData[]>(observer => {
      const page = (query && query.page) ? query.page : 1
      const get = ActivityModel.getActivities(_boundToObjectId, page)
      if (get) {
        return get
      }
      return Observable.fromPromise(ActivityFetch.fetchAll(_boundToObjectType, _boundToObjectId, query))
        .catch(err => errorHandler(observer, err))
        .concatMap(activities => ActivityModel.addToObject(_boundToObjectId, activities, page))
    })
  }

  addActivity(data: ActivitySaveData): Observable<ActivityData> {
    return Observable.create((observer: Observer<ActivityData>) => {
      Observable.fromPromise(ActivityFetch.add(data))
        .catch(err => observableError(observer, err))
        .concatMap(a => ActivityModel.addOne(a).take(1))
        .forEach(r => observer.next(r))
        .then(() => observer.complete())
    })
  }
}
