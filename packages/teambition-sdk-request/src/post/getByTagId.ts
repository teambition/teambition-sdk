import { Observable } from 'rxjs/Observable'
import { OrderDescription, Query, QueryToken } from 'reactivedb'
import { CacheStrategy, SDK, SDKFetch, PostSchema } from 'teambition-sdk-core'
import { TagId } from 'teambition-types'

import { PagingQuery, UrlPagingQuery, normPagingQuery } from '../utils'

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

declare module 'teambition-sdk-core/dist/cjs/SDKFetch' {
  // tslint:disable-next-line no-shadowed-variable
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

  const selectStmt: Query<PostSchema> = {
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

declare module 'teambition-sdk-core/dist/cjs/SDK' {
  // tslint:disable-next-line no-shadowed-variable
  export interface SDK {
    getPostsByTagId: typeof getByTagId
  }
}
