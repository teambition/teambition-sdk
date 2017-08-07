import { Observable } from 'rxjs/Observable'
import { LikeSchema, SDK, SDKFetch } from 'teambition-sdk-core'
import { DetailObjectId, DetailObjectType } from 'teambition-types'

export function toggleLikeFetch (
  this: SDKFetch,
  objectType: DetailObjectType,
  objectId: DetailObjectId,
  isLike: boolean
): Observable<LikeSchema> {
  const fetchNamespace = objectType !== 'entry' ? `${objectType}s` : 'entries'
  const uri = `${fetchNamespace}/${objectId}/like`
  const dist = isLike ? this.delete<LikeSchema>(uri) : this.post<LikeSchema>(uri)
  return dist.map(r => {
    r._id = `${objectId}:like`
    return r
  })
}

SDKFetch.prototype.toggleLike = toggleLikeFetch

declare module 'teambition-sdk-core/dist/cjs/SDKFetch' {
  // tslint:disable-next-line no-shadowed-variable
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

declare module 'teambition-sdk-core/dist/cjs/SDK' {
  // tslint:disable-next-line no-shadowed-variable
  interface SDK {
    toggleLike: typeof toggleLike
  }
}
