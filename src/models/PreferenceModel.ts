'use strict'
import { Observable } from 'rxjs/Observable'
import Model from './BaseModel'
import { PreferenceData } from '../schemas/Preference'

export class PreferenceModel extends Model {

  public preferenceId: string

  destructor() {
    this.preferenceId = null
  }

  set(data: PreferenceData): Observable<PreferenceData> {
    this.preferenceId = data._id
    return this._save(data)
  }

  get(): Observable<PreferenceData> {
    return this._get<PreferenceData>(this.preferenceId)
  }

  update(patch: any): Observable<any> {
    if (!this.preferenceId) {
      return Observable.throw(new Error('Preference not exist'))
    }
    return super.update(this.preferenceId, patch)
  }

}

export default new PreferenceModel()
