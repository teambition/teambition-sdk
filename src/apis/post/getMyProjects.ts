import { QueryToken } from 'reactivedb'
import { SDK, CacheStrategy } from '../../SDK'
import { ProjectId, UserId } from 'teambition-types'
import { PostSchema } from '../../schemas/Post'
import { GetPostsQuery } from './getProjects'
import { pagination } from '../../utils'

export function getMyProjectPosts (
  this: SDK,
  userId: UserId,
  _projectId: ProjectId,
  query?: GetPostsQuery<'my'>
): QueryToken<PostSchema> {
  return this.lift<PostSchema>({
    request: this.fetch.getPosts(_projectId, query),
    query: {
      where: {
        _projectId,
        isArchived: false,
        _creatorId: userId
      },
      orderBy: [
        { fieldName: 'pin', orderBy: 'DESC' },
        { fieldName: 'created', orderBy: 'DESC' }
      ],
      ...pagination(query.count, query.page)
    },
    tableName: 'Post',
    cacheValidate: CacheStrategy.Request,
    assocFields: {
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
