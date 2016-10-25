'use strict'
import { Observable } from 'rxjs/Observable'
import BaseModel from './BaseModel'
import Collection from './BaseCollection'
import { ActivityData, default as Activity } from '../schemas/Activity'
import { datasToSchemas, dataToSchema } from '../utils/index'
import { DetailObjectId } from '../teambition'

export class ActivityModel extends BaseModel {

  private _schemaName = 'Activity'

  addOne(activity: ActivityData): Observable<ActivityData> {
    const result = dataToSchema<ActivityData>(activity, Activity)
    return this._save(result)
  }

  /**
   * 索引为 `activities/${_boundToObjectId}`
   */
  addToObject(_boundToObjectId: DetailObjectId, activities: ActivityData[], page: number): Observable<ActivityData[]> {
    const dbIndex = `activities/${_boundToObjectId}`
    const name = dbIndex
    const result = datasToSchemas<ActivityData>(activities, Activity)
    let collection = this._collections.get(name)
    if (!collection) {
      collection = new Collection(this._schemaName, (data: Activity) => {
        return data._boundToObjectId === _boundToObjectId
      }, dbIndex)
      this._collections.set(name, collection)
    }
    return collection.addPage(page, result)
  }

  getActivities(_boundToObjectId: DetailObjectId, page: number): Observable<ActivityData[]> {
    const collection = this._collections.get(`activities/${_boundToObjectId}`)
    if (collection) {
      return collection.get(page)
    }
    return null
  }
}

export default new ActivityModel
