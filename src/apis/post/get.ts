import { QueryToken } from 'reactivedb'
import { Observable } from 'rxjs/Observable'
import { SDK } from '../../SDK'
import { SDKFetch } from '../../SDKFetch'
import { PostData } from '../../schemas/Post'
import { PostId } from 'teambition-types'

export function getPostFetch(
  this: SDKFetch,
  postId: PostId,
  query?: any
): Observable<PostData> {
  return this.get<PostData>(`/posts/${postId}`, query)
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
): QueryToken<PostData> {
  query = query || { }
  return this.lift<PostData>({
    request: this.fetch.getPost(postId, query),
    tableName: 'Post',
    cacheValidate: 'cache',
    query: {
      where: { _id: postId }
    },
    assoFields: {
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
