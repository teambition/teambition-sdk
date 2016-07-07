'use strict'
import { Observable } from 'rxjs/Observable'
import BaseModel from './BaseModel'
import Collection from './BaseCollection'
import Activity from '../schemas/Activity'
import { datasToSchemas, dataToSchema } from '../utils/index'

export class ActivityModel extends BaseModel {

  private _schemaName = 'Activity'

  private _collections = new Map<string, Collection<Activity>>()

  destructor() {
    this._collections.clear()
  }

  addOne(activity: Activity): Observable<Activity> {
    const result = dataToSchema<Activity>(activity, Activity)
    return this._save(result)
  }

  /**
   * 索引为 `activities/${_boundToObjectId}`
   */
  addToObject(_boundToObjectId: string, activities: Activity[], page: number): Observable<Activity[]> {
    const dbIndex = `activities/${_boundToObjectId}`
    const name = dbIndex
    const result = datasToSchemas<Activity>(activities, Activity)
    let collection = this._collections.get(name)
    if (!collection) {
      collection = new Collection(this._schemaName, (data: Activity) => {
        return data._boundToObjectId === _boundToObjectId
      }, dbIndex)
      this._collections.set(name, collection)
    }
    return collection.addPage(page, result)
  }

  getActivities(_boundToObjectId: string, page: number): Observable<Activity[]> {
    const collection = this._collections.get(`activities/${_boundToObjectId}`)
    if (collection) {
      return collection.get(page)
    }
    return null
  }
}

export default new ActivityModel()
