'use strict'
import { Observable } from 'rxjs/Observable'
import PreferenceFetch from '../fetchs/PreferenceFetch'
import PreferenceModel from '../models/PreferenceModel'
import { PreferenceData } from '../schemas/Preference'
import { makeColdSignal } from './utils'

export class PreferenceAPI {

  getPreference(): Observable<PreferenceData> {
    return makeColdSignal<PreferenceData>(() => {
      const get = PreferenceModel.get()
      if (get) {
        return get
      }
      return PreferenceFetch.getPreference()
        .concatMap(data => PreferenceModel.set(data))
    })
  }

  update (preferenceId: string, patch: any): Observable<PreferenceData> {
    return PreferenceFetch.update(preferenceId, patch)
      .concatMap(data => PreferenceModel.update(data))
  }
}

export default new PreferenceAPI
