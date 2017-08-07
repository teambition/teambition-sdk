import { Observable } from 'rxjs/Observable'
import { SDK, SDKFetch } from 'teambition-sdk-core'
import { PostId } from 'teambition-types'

export function deletePostFetch (
  this: SDKFetch,
  _postId: PostId
): Observable<void> {
  return this.delete<void>(`posts/delete/${_postId}`)
}

SDKFetch.prototype.deletePost = deletePostFetch

declare module 'teambition-sdk-core/dist/cjs/SDKFetch' {
  // tslint:disable-next-line no-shadowed-variable
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

declare module 'teambition-sdk-core/dist/cjs/SDK' {
  // tslint:disable-next-line no-shadowed-variable
  interface SDK {
    deletePost: typeof deletePost
  }
}
