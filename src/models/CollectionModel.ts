'use strict'
import { Observable } from 'rxjs/Observable'
import BaseModel from './BaseModel'
import { TBCollectionData, default as TBCollection } from '../schemas/Collection'
import { dataToSchema, datasToSchemas } from '../utils/index'
import { CollectionId } from '../teambition'

export class CollectionModel extends BaseModel {

  private _schemaName = 'TBCollection'

  addOne(collection: TBCollectionData): Observable<TBCollectionData> {
    const result = dataToSchema<TBCollectionData>(collection, TBCollection)
    return this._save(result)
  }

  getOne(collectionId: CollectionId): Observable<TBCollectionData> {
    return this._get<TBCollectionData>(<any>collectionId)
  }

  addCollections(_parentId: CollectionId, collections: TBCollectionData[]): Observable<TBCollectionData[]> {
    const result = datasToSchemas<TBCollectionData>(collections, TBCollection)
    return this._saveCollection<TBCollectionData>(`collections/${_parentId}`, result, this._schemaName, (data: TBCollectionData) => {
      return data._parentId === _parentId && !data.isArchived
    })
  }

  getCollections(_parentId: CollectionId): Observable<TBCollectionData[]> {
    return this._get<TBCollectionData[]>(`collections/${_parentId}`)
  }
}

export default new CollectionModel
