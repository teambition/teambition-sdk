import { Query, QueryToken } from 'reactivedb'
import { SDK, CacheStrategy } from '../../SDK'
import { ProjectId, UserId } from 'teambition-types'
import { PostSchema } from '../../schemas/Post'
import { GetPostsQuery, GetPostsUrlQuery } from './getProjects'
import { normPagingQuery } from '../../utils'

export function getMyProjectPosts (
  this: SDK,
  userId: UserId,
  _projectId: ProjectId,
  query?: GetPostsQuery<'my'>
): QueryToken<PostSchema> {
  const queryPair = normPagingQuery(query)

  const urlQuery = queryPair.forUrl as GetPostsUrlQuery<'my'>
  const { skip, limit } = queryPair.forSql

  const selectStmt: Query<PostSchema> = {
    where: {
      _projectId,
      isArchived: false,
      _creatorId: userId
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

SDK.prototype.getMyProjectPosts = getMyProjectPosts

declare module '../../SDK' {
  export interface SDK {
    getMyProjectPosts: typeof getMyProjectPosts
  }
}
