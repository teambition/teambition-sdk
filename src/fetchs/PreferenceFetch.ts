'use strict'
import { Observable } from 'rxjs/Observable'
import BaseFetch from './BaseFetch'
import { PreferenceData } from '../schemas/Preference'

export class PreferenceFetch extends BaseFetch {

  getPreference(): Observable<PreferenceData> {
    return this.fetch.get(`preferences`)
  }

  update(_id: string, patch: any): Observable<any> {
    return this.fetch.put(`preferences/${_id}`, patch)
  }
}

export default new PreferenceFetch()
