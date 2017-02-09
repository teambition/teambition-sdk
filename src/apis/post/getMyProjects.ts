import { QueryToken } from 'reactivedb'
import { SDK } from '../../SDK'
import { ProjectId, UserId } from 'teambition-types'
import { PostData } from '../../schemas/Post'
import { GetPostsQuery } from './getProjects'

export function getMyProjectPosts (
  this: SDK,
  userId: UserId,
  _projectId: ProjectId,
  query?: GetPostsQuery<'my'>
): QueryToken<PostData> {
  return this.lift<PostData>({
    request: this.fetch.getPosts(_projectId, query),
    query: {
      limit: query.count,
      skip: (query.count * (query.page - 1)),
      where: {
        _projectId, isArchived: false,
        _creatorId: userId
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

SDK.prototype.getMyProjectPosts = getMyProjectPosts

declare module '../../SDK' {
  export interface SDK {
    getMyProjectPosts: typeof getMyProjectPosts
  }
}
