'use strict'
import { Observable } from 'rxjs/Observable'
import BaseFetch from './BaseFetch'
import { PreferenceData } from '../schemas/Preference'
import { PreferenceId } from '../teambition'

export class PreferenceFetch extends BaseFetch {

  getPreference(): Observable<PreferenceData> {
    return this.fetch.get(`preferences`)
  }

  update(_id: PreferenceId, patch: any): Observable<any> {
    return this.fetch.put(`preferences/${_id}`, patch)
  }
}

export default new PreferenceFetch
