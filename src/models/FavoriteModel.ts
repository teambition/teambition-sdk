import { Observable } from 'rxjs/Observable'
import BaseModel from './BaseModel'
import { FavoriteData, default as Favorite } from '../schemas/Favorite'
import { dataToSchema, datasToSchemas } from '../utils/index'
import Collection from './BaseCollection'
import { FavoriteId, UserId } from '../teambition'

export class FavoriteModel extends BaseModel {

  private _schemaName = 'Favorite'

  addOne(favorite: FavoriteData) {
    const result = dataToSchema<FavoriteData>(favorite, Favorite)
    return this._save(result)
  }

  getOne(favoriteId: FavoriteId) {
    return this._get<FavoriteData>(<any>favoriteId)
  }

  addByUserId(userId: UserId, favorites: FavoriteData[], page: number): Observable<FavoriteData[]> {
    const dbIndex = `user:favorites/${userId}`
    const result = datasToSchemas(favorites, Favorite)
    let collection = this._collections.get(dbIndex)
    if (!collection) {
      collection = new Collection(
        this._schemaName,
        (data: FavoriteData) => data._creatorId === userId,
        dbIndex
      )
      this._collections.set(dbIndex, collection)
    }
    return collection.addPage(page, result)
  }

  getByUserId(userId: UserId, page: number): Observable<FavoriteData[]> {
    const dbIndex = `user:favorites/${userId}`
    const collection = this._collections.get(dbIndex)
    if (collection) {
      return collection.get(page)
    }
    return null
  }
}

export default new FavoriteModel
