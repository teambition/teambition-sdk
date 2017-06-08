import { Observable } from 'rxjs/Observable'
import { LikeSchema } from '../../schemas/Like'
import { Http } from '../../Net'
import { SDKFetch } from '../../SDKFetch'
import { SDK } from '../../SDK'
import { DetailObjectId, DetailObjectType } from 'teambition-types'

export function toggleLikeFetch (
  this: SDKFetch,
  objectType: DetailObjectType,
  objectId: DetailObjectId,
  isLike: boolean
): Http<LikeSchema> {
  const fetchNamespace = objectType !== 'entry' ? `${objectType}s` : 'entries'
  const uri = `${fetchNamespace}/${objectId}/like`
  const dist = isLike ? this.delete<LikeSchema>(uri) : this.post<LikeSchema>(uri)
  return dist.map((v$: Observable<LikeSchema>) => v$.map(r => {
        r._id = `${objectId}:like`
        return r
       }))
}

SDKFetch.prototype.toggleLike = toggleLikeFetch

declare module '../../SDKFetch' {
  interface SDKFetch {
    toggleLike: typeof toggleLikeFetch
  }
}

export function toggleLike (
  this: SDK,
  objectType: DetailObjectType,
  objectId: DetailObjectId,
  isLike: boolean
): Observable<LikeSchema> {
  return this.lift({
    request: this.fetch.toggleLike(objectType, objectId, isLike),
    tableName: 'Like',
    method: 'update',
    clause: { _id: `${objectId}:like` }
  })
}

SDK.prototype.toggleLike = toggleLike

declare module '../../SDK' {
  interface SDK {
    toggleLike: typeof toggleLike
  }
}
