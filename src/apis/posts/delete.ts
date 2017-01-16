import { Observable } from 'rxjs/Observable'
import { SDK } from '../../SDK'
import { SDKFetch } from '../../SDKFetch'
import { PostId } from 'teambition-types'

export function deletePostFetch (
  this: SDKFetch,
  _postId: PostId
) {
  return this.delete(`/posts/delete/${_postId}`)
}

SDKFetch.prototype.deletePost = deletePostFetch

declare module '../../SDKFetch' {
  interface SDKFetch {
    deletePost: typeof deletePostFetch
  }
}

export function deletePost(
  this: SDK,
  postId: PostId
): Observable<void> {
  return this.lift<void>({
    tableName: 'Post',
    request: this.fetch.deletePost(postId),
    method: 'delete',
    clause: { _id: postId }
  })
}

SDK.prototype.deletePost = deletePost

declare module '../../SDK' {
  interface SDK {
    deletePost: typeof deletePost
  }
}
