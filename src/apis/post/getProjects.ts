import { QueryToken, OrderDescription, Query } from 'reactivedb'
import { SDK, CacheStrategy } from '../../SDK'
import { Http } from '../../Net'
import { SDKFetch } from '../../SDKFetch'
import { ProjectId } from 'teambition-types'
import { PostSchema } from '../../schemas/Post'
import { pagination, omit } from '../../utils'

export type ProjectPostType = 'all' | 'my'

export interface GetPostsQuery<T extends ProjectPostType> {
  page: number
  type: T
  count: number
  fields?: string
  orderBy?: OrderDescription[]
  [index: string]: any
}

export function getPostsFetch<T extends ProjectPostType>(
  this: SDKFetch,
  _projectId: ProjectId,
  query: GetPostsQuery<T>
): Http<PostSchema[]> {
  return this.get<PostSchema[]>(`projects/${_projectId}/posts`, query)
}

SDKFetch.prototype.getPosts = getPostsFetch

declare module '../../SDKFetch' {
  interface SDKFetch {
    getPosts: typeof getPostsFetch
  }
}

export function getAllProjectPosts (
  this: SDK,
  _projectId: ProjectId,
  query?: GetPostsQuery<'all'>
): QueryToken<PostSchema> {
  const defaultQuery: Partial<GetPostsQuery<'all'>> = {
    count: 500,
    page: 1
  }
  const q = query ? { ...defaultQuery, ...query } : defaultQuery
  const rdbQuery: Query<any> = {
    where: {
      _projectId,
      isArchived: false,
    },
    ...pagination(q.count!, q.page!)
  }
  if (q.orderBy) {
    rdbQuery.orderBy = q.orderBy
  }
  const urlQuery = omit(query, 'orderBy')
  return this.lift<PostSchema>({
    request: this.fetch.getPosts(_projectId, urlQuery),
    query: rdbQuery,
    tableName: 'Post',
    cacheValidate: CacheStrategy.Request,
    assocFields: {
      creator: ['_id', 'name', 'avatarUrl']
    }
  })
}

SDK.prototype.getAllProjectPosts = getAllProjectPosts

declare module '../../SDK' {
  export interface SDK {
    getAllProjectPosts: typeof getAllProjectPosts
  }
}
