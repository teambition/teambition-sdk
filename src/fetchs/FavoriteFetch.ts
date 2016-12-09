import { Observable } from 'rxjs/Observable'
import BaseFetch from './BaseFetch'
import { FavoriteData } from '../schemas/Favorite'
import { FavoriteId } from '../teambition'

export class FavoriteFetch extends BaseFetch {

  get(favoriteId: FavoriteId, query?: any): Observable<FavoriteData> {
    return this.fetch.get(`favorites/${favoriteId}`, query)
  }

  getByMe(query?: any): Observable<{
    total: number
    results: FavoriteData[]
  }> {
    return this.fetch.get(`favorites/me`, query)
  }
}

export default new FavoriteFetch
