'use strict'
import { Observable } from 'rxjs'
import BaseModel from './BaseModel'
import Activity from '../schemas/Activity'
import { datasToSchemas, dataToSchema } from '../utils/index'

export class ActivityModel extends BaseModel {

  private _schemaName = 'Activity'

  addOne(activity: Activity): Observable<Activity> {
    const result = dataToSchema<Activity>(activity, Activity)
    return this._save(result)
  }

  addToObject(_boundToObjectId: string, activities: Activity[]): Observable<Activity[]> {
    const name = `activities/${_boundToObjectId}`
    const result = datasToSchemas<Activity>(activities, Activity)
    return this._saveCollection(name, result, this._schemaName, (data: Activity) => {
      return data._boundToObjectId === _boundToObjectId
    })
  }

  getActivities(_boundToObjectId: string): Observable<Activity[]> {
    return this._get<Activity[]>(`activities/${_boundToObjectId}`)
  }
}

export default new ActivityModel()
