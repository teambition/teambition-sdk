'use strict'
import { Observable } from 'rxjs/Observable'
import Model from './BaseModel'
import SubscribeSchema, { SubscribeData } from '../schemas/Subscribe'
import { dataToSchema } from '../utils'

export class SubscribeModel extends Model {

  private _alias = new Map<string, Observable<SubscribeData>>()

  destructor() {
    super.destructor()
    this._alias.clear()
  }

  addOne(_organizationId: string, data: SubscribeData): Observable<SubscribeData> {
    const result = dataToSchema(data, SubscribeSchema)
    const signal = this._save(result)
    this._alias.set(_organizationId, signal)
    return signal
  }

  getOne(_organizationId: string): Observable<SubscribeData> {
    return this._alias.get(_organizationId)
  }
}

export default new SubscribeModel()
