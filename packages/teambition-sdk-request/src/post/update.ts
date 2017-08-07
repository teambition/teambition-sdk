import { Observable } from 'rxjs/Observable'
import { SDK, SDKFetch, PostModeOptions } from 'teambition-sdk-core'
import { FileId, UserId, PostId } from 'teambition-types'

export interface UpdatePostOptions {
  title?: string
  content?: string
  postMode?: PostModeOptions
  pin?: boolean
  attachments?: FileId[]
  involveMembers?: UserId[]
}

export function updatePostFetch(
  this: SDKFetch,
  _id: PostId,
  options: UpdatePostOptions
): Observable<typeof options> {
  return this.put<typeof options>(`posts/${_id}`, options)
}

SDKFetch.prototype.updatePost = updatePostFetch

declare module 'teambition-sdk-core/dist/cjs/SDKFetch' {
  // tslint:disable-next-line no-shadowed-variable
  interface SDKFetch {
    updatePost: typeof updatePostFetch
  }
}

export function updatePost(
  this: SDK,
  _id: PostId,
  options: UpdatePostOptions
): Observable<UpdatePostOptions> {
  return this.lift<typeof options>({
    request: this.fetch.updatePost(_id, options),
    tableName: 'Post',
    method: 'update',
    clause: { _id }
  })
}

SDK.prototype.updatePost = updatePost

declare module 'teambition-sdk-core/dist/cjs/SDK' {
  // tslint:disable-next-line no-shadowed-variable
  interface SDK {
    updatePost: typeof updatePost
  }
}
