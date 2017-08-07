import { Observable } from 'rxjs/Observable'
import { OrderDescription, Query, QueryToken } from 'reactivedb'
import { CacheStrategy, SDK, SDKFetch, PostSchema } from 'teambition-sdk-core'
import { ProjectId } from 'teambition-types'

import { PagingQuery, UrlPagingQuery, normPagingQuery } from '../utils'

export type ProjectPostType = 'all' | 'my'

export type GetPostsQueryParams<T extends ProjectPostType> = {
  type: T,
  [key: string]: any
}

export interface GetPostsUrlQuery<T extends ProjectPostType>
  extends GetPostsQueryParams<T>, UrlPagingQuery {}

export interface GetPostsQuery<T extends ProjectPostType>
  extends GetPostsQueryParams<T>, PagingQuery {
    orderBy?: OrderDescription[]
  }

export function getPostsFetch<T extends ProjectPostType>(
  this: SDKFetch,
  _projectId: ProjectId,
  query: GetPostsUrlQuery<T>
): Observable<PostSchema[]> {
  return this.get<PostSchema[]>(`projects/${_projectId}/posts`, query)
}

SDKFetch.prototype.getPosts = getPostsFetch

declare module 'teambition-sdk-core/dist/cjs/SDKFetch' {
  // tslint:disable-next-line no-shadowed-variable
  interface SDKFetch {
    getPosts: typeof getPostsFetch
  }
}

export function getAllProjectPosts (
  this: SDK,
  _projectId: ProjectId,
  query?: GetPostsQuery<'all'>
): QueryToken<PostSchema> {
  const queryPair = normPagingQuery(query)

  const urlQuery = queryPair.forUrl as GetPostsUrlQuery<'all'>
  const { skip, limit } = queryPair.forSql

  const selectStmt: Query<PostSchema> = {
    where: {
      _projectId,
      isArchived: false,
    },
    skip,
    limit,
    ...(query && query.orderBy ? { orderBy: query.orderBy } : {})
  }

  return this.lift<PostSchema>({
    request: this.fetch.getPosts(_projectId, urlQuery),
    query: selectStmt,
    tableName: 'Post',
    cacheValidate: CacheStrategy.Request,
    assocFields: {
      creator: ['_id', 'name', 'avatarUrl']
    }
  })
}

SDK.prototype.getAllProjectPosts = getAllProjectPosts

declare module 'teambition-sdk-core/dist/cjs/SDK' {
  // tslint:disable-next-line no-shadowed-variable
  export interface SDK {
    getAllProjectPosts: typeof getAllProjectPosts
  }
}
