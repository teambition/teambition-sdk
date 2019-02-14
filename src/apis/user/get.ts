import { QueryToken } from '../../db'
import { SDK, CacheStrategy } from '../../SDK'
import { UserMe } from '../../schemas/UserMe'

export function getUserMe (
  this: SDK
): QueryToken<UserMe> {
  return this.lift({
    request: this.fetch.getUserMe(),
    cacheValidate: CacheStrategy.Cache,
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
