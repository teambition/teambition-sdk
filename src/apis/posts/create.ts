import { Observable } from 'rxjs/Observable'
import { SDK } from '../../SDK'
import { SDKFetch } from '../../SDKFetch'
import { PostData } from '../../schemas/Post'
import { ProjectId, visibility, FileId, UserId, TagId } from 'teambition-types'

export interface CreatePostOptions {
  _projectId: ProjectId
  title: string
  content: string
  postMode?: 'html' | 'txt'
  visiable?: visibility
  attachments?: FileId[]
  involveMembers?: UserId[]
  tagIds?: TagId[]
}

export function createPostFetch(this: SDKFetch, options: CreatePostOptions): Observable<PostData> {
  return this.post('/posts', options)
}

SDKFetch.prototype.createPost = createPostFetch

declare module '../../SDKFetch' {
  export interface SDKFetch {
    createPost: typeof createPostFetch
  }
}

export function createPost (this: SDK, options: CreatePostOptions): Observable<PostData> {
  return this.lift({
    request: this.fetch.createPost(options),
    tableName: 'Post',
    method: 'create'
  })
}

SDK.prototype.createPost = createPost

declare module '../../SDK' {
  export interface SDK {
    createPost: typeof createPost
  }
}
