import { QueryToken } from 'reactivedb'
import { Observable } from 'rxjs/Observable'
import { SDK, CacheStrategy } from '../../SDK'
import { SDKFetch } from '../../SDKFetch'
import { ProjectId } from 'teambition-types'
import { PostSchema } from '../../schemas/Post'
import { pagination } from '../../utils'

export type ProjectPostType = 'all' | 'my'

export interface GetPostsQuery<T extends ProjectPostType> {
  page: number
  type: T
  count: number
  fields?: string
  [index: string]: any
}

export function getPostsFetch<T extends ProjectPostType>(
  this: SDKFetch,
  _projectId: ProjectId,
  query: GetPostsQuery<T>
): Observable<PostSchema[]> {
  return this.get(`/projects/${_projectId}/posts`, query)
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
  return this.lift<PostSchema>({
    request: this.fetch.getPosts(_projectId, query),
    query: {
      ...pagination(query.count, query.page),
      where: {
        _projectId,
        isArchived: false
      },
      orderBy: [
        { fieldName: 'pin', orderBy: 'DESC' },
        { fieldName: 'created', orderBy: 'DESC' },
        { fieldName: 'lastCommentedAt', orderBy: 'DESC' }
      ]
    },
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
