import { Observable } from 'rxjs'
import { SDK } from '../../SDK'
import { SDKFetch } from '../../SDKFetch'
import { PostId } from 'teambition-types'

export function deletePostFetch (
  this: SDKFetch,
  _postId: PostId
): Observable<void> {
  return this.delete<void>(`posts/delete/${_postId}`)
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
