'use strict'
import { Observable } from 'rxjs/Observable'
import Model from './BaseModel'
import { PreferenceData, default as Preference } from '../schemas/Preference'
import { dataToSchema } from '../utils/index'

export class PreferenceModel extends Model {

  public preferenceId: string

  constructor() {
    super()
    PreferenceModel.TeardownLogics.add(() => {
      this.preferenceId = null
    })
  }

  set(data: PreferenceData): Observable<PreferenceData> {
    this.preferenceId = data._id
    const result = dataToSchema(data, Preference)
    return this._save(result)
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
