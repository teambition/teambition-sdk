import { QueryToken } from 'reactivedb'
import { Observable } from 'rxjs/Observable'
import { SDK } from '../../SDK'
import { SDKFetch } from '../../SDKFetch'
import { ProjectId } from 'teambition-types'
import { PostData } from '../../schemas/Post'

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
): Observable<PostData[]> {
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
): QueryToken<PostData> {
  return this.lift<PostData>({
    request: this.fetch.getPosts(_projectId, query),
    query: {
      limit: query.count,
      skip: (query.count * (query.page - 1)),
      where: {
        _projectId, isArchived: false
      },
      orderBy: [
        { fieldName: 'pin', orderBy: 'DESC' },
        { fieldName: 'created', orderBy: 'DESC' }
      ]
    },
    tableName: 'Post',
    cacheValidate: 'request',
    assoFields: {
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
