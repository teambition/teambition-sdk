'use strict'
import { Observable } from 'rxjs/Observable'
import Model from './BaseModel'
import Collection from './BaseCollection'
import { EntrycategoryData, default as Entrycategory } from '../schemas/Entrycategory'
import { datasToSchemas, dataToSchema } from '../utils/index'
import { EntryCategoryId, ProjectId } from '../teambition'

export class EntrycategoryModel extends Model {
  private _schemaName = 'Entrycategory'

  addOne(entrycategory: EntrycategoryData): Observable<EntrycategoryData> {
    const result = dataToSchema<EntrycategoryData>(entrycategory, Entrycategory)
    return this._save(result)
  }

  addEntrycategories(projectId: ProjectId, entrycategories: EntrycategoryData[], page: number): Observable<EntrycategoryData[]> {
    const dbIndex = `project:entrycategories/${projectId}`
    const result = datasToSchemas<EntrycategoryData>(entrycategories, Entrycategory)

    let collection = this._collections.get(dbIndex)
    if (!collection) {
      collection = new Collection(this._schemaName, (data: EntrycategoryData) => {
        return data._projectId === projectId
      }, dbIndex)
      this._collections.set(dbIndex, collection)
    }
    return collection.addPage(page, result)
  }

  getOne(_id: EntryCategoryId): Observable<EntrycategoryData> {
    return this._get<EntrycategoryData>(<any>_id)
  }

  getEntrycategories(projectId: ProjectId, page: number): Observable<EntrycategoryData[]> {
    const collection = this._collections.get(`project:entrycategories/${projectId}`)
    if (collection) {
      return collection.get(page)
    }
    return null
  }
}

export default new EntrycategoryModel
