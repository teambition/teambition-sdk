import { QueryToken } from 'reactivedb'
import { SDK, CacheStrategy, UserMe } from 'teambition-sdk-core'

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

declare module 'teambition-sdk-core/dist/cjs/SDK' {
  // tslint:disable-next-line no-shadowed-variable
  interface SDK {
    getUserMe: typeof getUserMe
  }
}
