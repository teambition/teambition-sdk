import { Observable } from 'rxjs/Observable'
import { QueryToken } from 'reactivedb'
import { LikeSchema } from '../../schemas/Like'
import { Http } from '../../Net'
import { SDKFetch } from '../../SDKFetch'
import { SDK, CacheStrategy } from '../../SDK'
import { DetailObjectId, DetailObjectType } from 'teambition-types'

export function getLikeFetch (this: SDKFetch, objectType: DetailObjectType, objectId: DetailObjectId): Http<LikeSchema> {
  const fetchNamespace = objectType !== 'entry' ? `${objectType}s` : 'entries'
  return this.get<LikeSchema>(`${fetchNamespace}/${objectId}/like`, { all: '1' })
      .map((v$: Observable<LikeSchema>) => v$.map(r => {
        r._id = `${objectId}:like`
        return r
       }))
}

SDKFetch.prototype.getLike = getLikeFetch

declare module '../../SDKFetch' {
  interface SDKFetch {
    getLike: typeof getLikeFetch
  }
}

export function getLike (
  this: SDK,
  objectType: DetailObjectType,
  objectId: DetailObjectId
): QueryToken<LikeSchema> {
  return this.lift<LikeSchema>({
    cacheValidate: CacheStrategy.Cache,
    request: this.fetch.getLike(objectType, objectId),
    tableName: 'Like',
    query: {
      where: { _id: `${objectId}:like` }
    }
  })
}

SDK.prototype.getLike = getLike

declare module '../../SDK' {
  interface SDK {
    getLike: typeof getLike
  }
}
