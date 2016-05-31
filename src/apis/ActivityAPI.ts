'use strict'
import { Observable, Observer } from 'rxjs'
import ActivityModel from '../models/ActivityModel'
import Activity from '../schemas/Activity'
import { ActivitySaveData, default as ActivityFetch } from '../fetchs/ActivityFetch'
import { makeColdSignal, errorHandler } from './utils'

export interface GetActivitiesOptions {
  language: string
}

export class ActivityAPI {
  constructor() {
    ActivityModel.destructor()
  }

  getActivities(_boundToObjectId: string, query?: GetActivitiesOptions): Observable<Activity[]> {
    return makeColdSignal(observer => {
      return Observable.fromPromise(ActivityFetch.fetchAll(_boundToObjectId, query))
        .catch(err => errorHandler(observer, err))
        .concatMap(activities => ActivityModel.addToObject(_boundToObjectId, activities))
    })
  }

  addActivity(data: ActivitySaveData): Observable<Activity> {
    return Observable.create((observer: Observer<Activity>) => {
      Observable.fromPromise(ActivityFetch.add(data))
        .catch(err => errorHandler(observer, err))
        .concatMap(a => ActivityModel.add(a))
        .forEach(r => observer.next(r))
    })
  }
}
