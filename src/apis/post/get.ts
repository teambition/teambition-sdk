import { Observable } from 'rxjs/Observable'
import { QueryToken } from 'reactivedb'
import { SDK, CacheStrategy } from '../../SDK'
import { SDKFetch } from '../../SDKFetch'
import { PostSchema } from '../../schemas/Post'
import { PostId } from 'teambition-types'

export function getPostFetch(
  this: SDKFetch,
  postId: PostId,
  query?: any
): Observable<PostSchema> {
  return this.get<PostSchema>(`posts/${postId}`, query)
}

SDKFetch.prototype.getPost = getPostFetch

declare module '../../SDKFetch' {
  interface SDKFetch {
    getPost: typeof getPostFetch
  }
}

export function getPost (
  this: SDK,
  postId: PostId,
  query?: any
): QueryToken<PostSchema> {
  query = query || { }
  return this.lift<PostSchema>({
    request: this.fetch.getPost(postId, query),
    tableName: 'Post',
    cacheValidate: CacheStrategy.Cache,
    query: {
      where: { _id: postId }
    },
    assocFields: {
      creator: ['_id', 'name', 'avatarUrl']
    }
  })
}

SDK.prototype.getPost = getPost

declare module '../../SDK' {
  interface SDK {
    getPost: typeof getPost
  }
}
