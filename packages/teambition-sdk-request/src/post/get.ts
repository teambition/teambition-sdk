import { Observable } from 'rxjs/Observable'
import { QueryToken } from 'reactivedb'
import { CacheStrategy, SDK, SDKFetch, PostSchema } from 'teambition-sdk-core'
import { PostId } from 'teambition-types'

export function getPostFetch(
  this: SDKFetch,
  postId: PostId,
  query?: any
): Observable<PostSchema> {
  return this.get<PostSchema>(`posts/${postId}`, query)
}

SDKFetch.prototype.getPost = getPostFetch

declare module 'teambition-sdk-core/dist/cjs/SDKFetch' {
  // tslint:disable-next-line no-shadowed-variable
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

declare module 'teambition-sdk-core/dist/cjs/SDK' {
  // tslint:disable-next-line no-shadowed-variable
  interface SDK {
    getPost: typeof getPost
  }
}
