'use strict'
import 'rxjs/add/observable/fromPromise'
import 'rxjs/add/operator/catch'
import 'rxjs/add/operator/concatMap'
import 'rxjs/add/operator/take'
import 'rxjs/add/operator/mapTo'
import { Observable } from 'rxjs/Observable'
import ActivityModel from '../models/ActivityModel'
import { ActivityData } from '../schemas/Activity'
import { ActivitySaveData, default as ActivityFetch } from '../fetchs/ActivityFetch'
import { makeColdSignal } from './utils'
import { DetailObjectTypes, DetailObjectId } from '../teambition'

export interface GetActivitiesOptions {
  lang?: string
  fields?: string
  count?: number
  page?: number
}

export class ActivityAPI {

  getActivities(
    _boundToObjectType: DetailObjectTypes,
    _boundToObjectId: DetailObjectId,
    query?: GetActivitiesOptions
  ): Observable<ActivityData[]> {
    return makeColdSignal<ActivityData[]>(() => {
      const page = (query && query.page) ? query.page : 1
      const get = ActivityModel.getActivities(_boundToObjectId, page)
      if (get) {
        return get
      }
      return ActivityFetch.fetchAll(_boundToObjectType, _boundToObjectId, query)
        .concatMap(activities =>
          ActivityModel.addToObject(_boundToObjectId, activities, page)
        )
    })
  }

  addActivity(data: ActivitySaveData): Observable<ActivityData> {
    return ActivityFetch.add(data)
      .concatMap(a =>
        ActivityModel.addOne(a)
          .take(1)
      )
  }
}

export default new ActivityAPI
