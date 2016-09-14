'use strict'
import { Observable } from 'rxjs/Observable'
import { Observer } from 'rxjs/Observer'
import PreferenceFetch from '../fetchs/PreferenceFetch'
import PreferenceModel from '../models/PreferenceModel'
import { PreferenceData } from '../schemas/Preference'
import { errorHandler, makeColdSignal } from './utils'

export class PreferenceAPI {

  getPreference(): Observable<PreferenceData> {
    return makeColdSignal<PreferenceData>(observer => {
      const get = PreferenceModel.get()
      if (get) {
        return get
      }
      return Observable.fromPromise(PreferenceFetch.getPreference())
        .catch(err => errorHandler(observer, err))
        .concatMap(data => PreferenceModel.set(data))
    })
  }

  update (preferenceId: string, patch: any): Observable<PreferenceData> {
    return Observable.create((observer: Observer<any>) => {
      Observable.fromPromise(PreferenceFetch.update(preferenceId, patch))
        .catch(err => errorHandler(observer, err))
        .concatMap(data => PreferenceModel.update(data))
        .forEach(result => observer.next(result))
        .then(data => observer.complete())
    })
  }
}
