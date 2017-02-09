import { Observable } from 'rxjs/Observable'
import { QueryToken } from 'reactivedb'
import { SDK } from '../../SDK'
import { TagId } from 'teambition-types'
import { PostData } from '../../schemas/Post'
import { SDKFetch } from '../../SDKFetch'

export function getByTagIdFetch(this: SDKFetch, tagId: TagId, query?: {
  page: number
  count: number
  fields?: string
  [index: string]: any
}): Observable<PostData[]> {
  return this.get(`/tags/${tagId}/posts`, query)
}

SDKFetch.prototype.getPostsByTagId = getByTagIdFetch

declare module '../../SDKFetch' {
  interface SDKFetch {
    getPostsByTagId: typeof getByTagIdFetch
  }
}

export function getByTagId (this: SDK, tagId: TagId, query?: {
  page: number
  count: number
  fields?: string
  [index: string]: any
}): QueryToken<PostData> {
  query = query || <any>{ }
  return this.lift<PostData>({
    request: this.fetch.getPostsByTagId(tagId, query),
    query: {
      limit: query.count,
      skip: (query.count * (query.page - 1)),
      where: {
        isArchived: false,
        tagIds: {
          $has: tagId
        }
      }
    },
    tableName: 'Post',
    cacheValidate: 'request',
    assoFields: {
      creator: ['_id', 'name', 'avatarUrl']
    },
    excludeFields: [ 'isFavorite', 'lastCommentedAt', 'objectlinksCount', 'likesCount', 'shareStatus' ]
  })
}

SDK.prototype.getPostsByTagId = getByTagId

declare module '../../SDK' {
  export interface SDK {
    getPostsByTagId: typeof getByTagId
  }
}
