'use strict'
import { Observable } from 'rxjs/Observable'
import Model from './BaseModel'
import SubscribeSchema, { SubscribeData } from '../schemas/Subscribe'
import { dataToSchema } from '../utils'
import { OrganizationId } from '../teambition'

export class SubscribeModel extends Model {

  private _alias = new Map<OrganizationId, Observable<SubscribeData>>()

  constructor() {
    super()
    SubscribeModel.TeardownLogics.add(() => {
      this._alias.clear()
    })
  }

  addOne(_organizationId: OrganizationId, data: SubscribeData): Observable<SubscribeData> {
    const result = dataToSchema(data, SubscribeSchema)
    const signal = this._save(result)
    this._alias.set(_organizationId, signal)
    return signal
  }

  getOne(_organizationId: OrganizationId): Observable<SubscribeData> {
    return this._alias.get(_organizationId)
  }
}

export default new SubscribeModel
