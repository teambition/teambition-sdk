import { Observable } from 'rxjs/Observable'
import { SDK, SDKFetch, PostModeOptions, PostSchema } from 'teambition-sdk-core'
import { ProjectId, Visibility, FileId, UserId, TagId } from 'teambition-types'

export interface CreatePostOptions {
  _projectId: ProjectId
  title: string
  content: string
  postMode?: PostModeOptions
  visiable?: Visibility
  attachments?: FileId[]
  involveMembers?: UserId[]
  tagIds?: TagId[]
}

export function createPostFetch(this: SDKFetch, options: CreatePostOptions): Observable<PostSchema> {
  return this.post<PostSchema>('posts', options)
}

SDKFetch.prototype.createPost = createPostFetch

declare module 'teambition-sdk-core/dist/cjs/SDKFetch' {
  // tslint:disable-next-line no-shadowed-variable
  export interface SDKFetch {
    createPost: typeof createPostFetch
  }
}

export function createPost (this: SDK, options: CreatePostOptions): Observable<PostSchema> {
  return this.lift({
    request: this.fetch.createPost(options),
    tableName: 'Post',
    method: 'create'
  })
}

SDK.prototype.createPost = createPost

declare module 'teambition-sdk-core/dist/cjs/SDK' {
  // tslint:disable-next-line no-shadowed-variable
  export interface SDK {
    createPost: typeof createPost
  }
}
