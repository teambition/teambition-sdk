'use strict'
import { Observable } from 'rxjs/Observable'
import { FavoriteData } from '../schemas/Favorite'
import FavoriteModel from '../models/FavoriteModel'
import FavoriteFetch from '../fetchs/FavoriteFetch'
import { FavoriteId, UserId } from '../teambition'
import { makeColdSignal } from './utils'

export class FavoriteAPI {

  get(favoriteId: FavoriteId, query?: any): Observable<FavoriteData> {
    return makeColdSignal<FavoriteData>(() => {
      const cache = FavoriteModel.getOne(favoriteId)
      if (cache && FavoriteModel.checkSchema(<string>favoriteId)) {
        return cache
      }
      return FavoriteFetch.get(favoriteId, query)
        .concatMap(favorite => FavoriteModel.addOne(favorite))
    })
  }

  getByMe(
    userId: UserId,
    query?: any
  ): Observable<FavoriteData[]> {
    return makeColdSignal<FavoriteData[]>(() => {
      const page = query && query.page || 1
      const cache = FavoriteModel.getByUserId(userId, page)
      if (cache) {
        return cache
      }
      return FavoriteFetch.getByMe(query)
        .map(data => data.results)
        .concatMap(favorites => {
          return FavoriteModel.addByUserId(userId, favorites, page)
        })
    })
  }
}

export default new FavoriteAPI
