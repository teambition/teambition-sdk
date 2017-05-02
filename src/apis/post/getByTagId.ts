import { Observable } from 'rxjs/Observable'
import { QueryToken, OrderDescription } from 'reactivedb'
import { SDK, CacheStrategy } from '../../SDK'
import { TagId } from 'teambition-types'
import { PostSchema } from '../../schemas/Post'
import { SDKFetch } from '../../SDKFetch'
import { pagination, omit } from '../../utils'

export function getByTagIdFetch(this: SDKFetch, tagId: TagId, query?: {
  page: number
  count: number
  fields?: string
  [index: string]: any
}): Observable<PostSchema[]> {
  return this.get(`tags/${tagId}/posts`, query)
}

SDKFetch.prototype.getPostsByTagId = getByTagIdFetch

declare module '../../SDKFetch' {
  interface SDKFetch {
    getPostsByTagId: typeof getByTagIdFetch
  }
}

export function getByTagId (this: SDK, tagId: TagId, query?: {
  page: number
  count: number
  fields?: string
  orderBy?: OrderDescription[]
  [index: string]: any
}): QueryToken<PostSchema> {
  const defaultQuery: Partial<typeof query> = {
    page: 1,
    count: 500
  }
  const q = query ? { ...defaultQuery, ...query } : defaultQuery
  const rdbQuery: any = {
    ...pagination(q.count!, q.page!),
    where: {
      isArchived: false,
      tagIds: {
        $has: tagId
      }
    }
  }
  if (q.orderBy) {
    rdbQuery.orderBy = q.orderBy
  }
  const urlQuery = omit(query, 'orderBy')
  return this.lift<PostSchema>({
    request: this.fetch.getPostsByTagId(tagId, urlQuery),
    query: rdbQuery,
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
