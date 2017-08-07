import { Observable } from 'rxjs/Observable'
import { QueryToken } from 'reactivedb'
import { CacheStrategy, LikeSchema, SDK, SDKFetch } from 'teambition-sdk-core'
import { DetailObjectId, DetailObjectType } from 'teambition-types'

export function getLikeFetch (
  this: SDKFetch,
  objectType: DetailObjectType,
  objectId: DetailObjectId
): Observable<LikeSchema> {
  const fetchNamespace = objectType !== 'entry' ? `${objectType}s` : 'entries'
  return this.get<LikeSchema>(`${fetchNamespace}/${objectId}/like`, { all: '1' })
    .map(r => ({ ...r, _id: `${objectId}:like` }))
}

SDKFetch.prototype.getLike = getLikeFetch

declare module 'teambition-sdk-core/dist/cjs/SDKFetch' {
  // tslint:disable-next-line no-shadowed-variable
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

declare module 'teambition-sdk-core/dist/cjs/SDK' {
  // tslint:disable-next-line no-shadowed-variable
  interface SDK {
    getLike: typeof getLike
  }
}
