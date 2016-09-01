'use strict'
import { Observable } from 'rxjs/Observable'
import BaseModel from './BaseModel'
import Collection from './BaseCollection'
import { HomeActivityData, default as HomeActivity } from '../schemas/HomeActivity'
import { datasToSchemas, dataToSchema } from '../utils/index'

export class HomeActivityModel extends BaseModel {

  private _schemaName = 'HomeActivity'

  addOne(activity: HomeActivityData): Observable<HomeActivityData> {
    const result = dataToSchema<HomeActivityData>(activity, HomeActivity)
    return this._save(result)
  }

  add(_projectId: string, activities: HomeActivityData[], page: number): Observable<HomeActivityData[]> {
    const dbIndex = `homeActivities/${_projectId}`
    const result = datasToSchemas<HomeActivityData>(activities, HomeActivity)
    let collection = this._collections.get(dbIndex)
    if (!collection) {
      collection = new Collection(
        this._schemaName,
        (data: HomeActivity) => {
          return data.rootId === `project#${_projectId}`
        },
        dbIndex
      )
      this._collections.set(dbIndex, collection)
    }
    return collection.addPage(page, result)
  }

  get(_projectId: string, page: number): Observable<HomeActivityData[]> {
    const dbIndex = `homeActivities/${_projectId}`
    const collection = this._collections.get(dbIndex)
    if (collection) {
      return collection.get(page)
    }
    return null
  }
}

export default new HomeActivityModel()
