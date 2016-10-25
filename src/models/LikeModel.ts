'use strict'
import { Observable } from 'rxjs/Observable'
import Model from './BaseModel'
import LikeSchema, { LikeData } from '../schemas/Like'
import { dataToSchema } from '../utils/index'

export class LikeModel extends Model {
  get(uid: string): Observable<LikeData> {
    return this._get<LikeData>(uid)
  }

  storeOne(uid: string, data: LikeData): Observable<LikeData> {
    const result = dataToSchema(data, LikeSchema)
    return this._save(result)
  }
}

export default new LikeModel
