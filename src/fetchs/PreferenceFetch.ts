'use strict'
import BaseFetch from './BaseFetch'
import { PreferenceData } from '../schemas/Preference'

export class PreferenceFetch extends BaseFetch {

  getPreference(): Promise<PreferenceData> {
    return this.fetch.get(`preferences`)
  }

  update(_id: string, patch: any): Promise<any> {
    return this.fetch.put(`preferences/${_id}`, patch)
  }
}

export default new PreferenceFetch()
