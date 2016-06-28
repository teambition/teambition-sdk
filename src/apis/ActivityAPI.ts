'use strict'
import { Observable, Observer } from 'rxjs'
import ActivityModel from '../models/ActivityModel'
import Activity from '../schemas/Activity'
import { ActivitySaveData, default as ActivityFetch } from '../fetchs/ActivityFetch'
import { makeColdSignal, errorHandler, observableError } from './utils'

export interface GetActivitiesOptions {
  lang?: string
  fields?: string
  count: number
  page: number
}

export class ActivityAPI {
  constructor() {
    ActivityModel.destructor()
  }

  getActivities(_boundToObjectType: string, _boundToObjectId: string, query?: GetActivitiesOptions): Observable<Activity[]> {
    return makeColdSignal<Activity[]>(observer => {
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

  addActivity(data: ActivitySaveData): Observable<Activity> {
    return Observable.create((observer: Observer<Activity>) => {
      Observable.fromPromise(ActivityFetch.add(data))
        .catch(err => observableError(observer, err))
        .concatMap(a => ActivityModel.addOne(a))
        .forEach(r => observer.next(r))
    })
  }
}
