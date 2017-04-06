import { QueryToken } from 'reactivedb'
import { SDK, CacheStrategy } from '../../SDK'
import { ProjectId, UserId } from 'teambition-types'
import { PostSchema } from '../../schemas/Post'
import { GetPostsQuery } from './getProjects'
import { pagination, omit } from '../../utils'

export function getMyProjectPosts (
  this: SDK,
  userId: UserId,
  _projectId: ProjectId,
  query?: GetPostsQuery<'my'>
): QueryToken<PostSchema> {
  const rdbQuery: any = {
    where: {
      _projectId,
      isArchived: false,
      _creatorId: userId
    },
    ...pagination(query.count, query.page)
  }
  if (query.orderBy) {
    rdbQuery.orderBy = query.orderBy
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

SDK.prototype.getMyProjectPosts = getMyProjectPosts

declare module '../../SDK' {
  export interface SDK {
    getMyProjectPosts: typeof getMyProjectPosts
  }
}
