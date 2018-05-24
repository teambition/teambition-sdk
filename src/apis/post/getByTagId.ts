import { Observable } from 'rxjs/Observable'
import { QueryToken, OrderDescription } from 'reactivedb'
import { SDK, CacheStrategy } from '../../SDK'
import { TagId } from 'teambition-types'
import { PostSchema } from '../../schemas/Post'
import { SDKFetch } from '../../SDKFetch'
import { normPagingQuery } from '../../utils'
import { PagingQuery, UrlPagingQuery } from '../../utils/internalTypes'

export type GetPostsByTagIdParams = {
  [key: string]: any
}

export interface GetPostsByTagIdUrlQuery extends GetPostsByTagIdParams, UrlPagingQuery {}

export interface GetPostsByTagIdQuery extends GetPostsByTagIdParams, PagingQuery {
  orderBy?: OrderDescription[]
}

export function getByTagIdFetch(
  this: SDKFetch,
  tagId: TagId,
  query?: GetPostsByTagIdUrlQuery
): Observable<PostSchema[]> {
  return this.get<PostSchema[]>(`tags/${tagId}/posts`, query)
}

SDKFetch.prototype.getPostsByTagId = getByTagIdFetch

declare module '../../SDKFetch' {
  interface SDKFetch {
    getPostsByTagId: typeof getByTagIdFetch
  }
}

export function getByTagId (
  this: SDK,
  tagId: TagId,
  query?: GetPostsByTagIdQuery
): QueryToken<PostSchema> {
  const queryPair =  normPagingQuery(query)

  const urlQuery = queryPair.forUrl as GetPostsByTagIdUrlQuery
  const { skip, limit } = queryPair.forSql

  const selectStmt = {
    where: {
      isArchived: false,
      tagIds: {
        $has: tagId
      }
    },
    skip,
    limit,
    ...(query && query.orderBy ? { orderBy: query.orderBy } : {})
  }

  return this.lift<PostSchema>({
    request: this.fetch.getPostsByTagId(tagId, urlQuery),
    query: selectStmt,
    tableName: 'Post',
    cacheValidate: CacheStrategy.Request,
    assocFields: {
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
