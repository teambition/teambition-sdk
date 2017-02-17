import { Observable } from 'rxjs/Observable'
import { QueryToken } from 'reactivedb'
import { SDK, CacheStrategy } from '../../SDK'
import { SDKFetch } from '../../SDKFetch'
import { UserMe } from '../../schemas/UserMe'

export function getUserMeFetch(
  this: SDKFetch
): Observable<UserMe> {
  return this.get<UserMe>('/users/me')
}

SDKFetch.prototype.getUserMe = getUserMeFetch

declare module '../../SDKFetch' {
  interface SDKFetch {
    getUserMe: typeof getUserMeFetch
  }
}

export function getUserMe (
  this: SDK
): QueryToken<UserMe> {
  return this.lift({
    request: this.fetch.getUserMe(),
    cacheValidate: CacheStrategy.Request,
    tableName: 'User',
    query: { }
  })
}

SDK.prototype.getUserMe = getUserMe

declare module '../../SDK' {
  interface SDK {
    getUserMe: typeof getUserMe
  }
}
