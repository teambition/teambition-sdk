import { Observable } from 'rxjs'
import { FileId, UserId, PostId } from 'teambition-types'
import { SDK } from '../../SDK'
import { SDKFetch } from '../../SDKFetch'
import { PostModeOptions } from '../../schemas/Post'

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

declare module '../../SDKFetch' {
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

declare module '../../SDK' {
  interface SDK {
    updatePost: typeof updatePost
  }
}
