'use strict'
import { Observable } from 'rxjs/Observable'
import BaseFetch from './BaseFetch'
import { PostData } from '../schemas/Post'
import {
  visibility,
  PostId,
  ProjectId,
  TagId,
  FileId,
  UserId
} from '../teambition'

export type ProjectPostType = 'all' | 'my'

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

export interface UpdatePostOptions {
  title?: string
  content?: string
  postMode?: 'html' | 'txt'
  pin?: boolean
  attachments?: FileId[]
  involveMembers?: UserId[]
}

export type UpdateInvolves = {
  involveMembers: UserId[]
} | {
  addInvolvers?: UserId[]
  delInvolvers?: UserId[]
}

export interface ArchivePostResponse {
  isArchived: boolean
  updated: string
  _id: PostId
  _projectId: ProjectId
}

export interface UnArchivePostResponse {
  isArchived: boolean
  updated: string
  _id: PostId
  _projectId: ProjectId
}

export interface UpdateInvolvesResponse {
  _id: PostId
  involveMembers: UserId[]
  updated: string
}

export interface UpdatePinResponse {
  _id: PostId
  pin: boolean
  updated: string
}

export interface UpdateTagsResponse {
  _id: PostId
  tagIds: TagId[]
  updated: string
}

export interface MovePostResponse {
  _id: string
  _projectId: string
  attachments: string[]
  involveMembers: UserId[]
  tagIds: string[]
  updated: string
}

export class PostFetch extends BaseFetch {
  create(post: CreatePostOptions): Observable<PostData> {
    return this.fetch.post(`posts`, post)
  }

  get(_postId: PostId, query?: any): Observable<PostData> {
    return this.fetch.get(`posts/${_postId}`, query)
  }

  getProjectPosts(_projectId: ProjectId, type: ProjectPostType, query?: {
    page: number
    count: number
    fields?: string
  }): Observable<PostData[]> {
    if (type) {
      if (!query) {
        query = Object.create(null)
      }
      query['type'] = type
    }
    return this.fetch.get(`projects/${_projectId}/posts`, query)
  }

  getByTagId(tagId: TagId, query?: any): Observable<PostData[]> {
    return this.fetch.get(`tags/${tagId}/posts`, query)
  }

  update(postId: PostId, post: UpdatePostOptions): Observable<any> {
    return this.fetch.put(`posts/${postId}`, post)
  }

  delete(postId: PostId): Observable<void> {
    return this.fetch.delete<void>(`posts/${postId}`)
  }

  archive(postId: PostId): Observable<ArchivePostResponse> {
    return this.fetch.post(`posts/${postId}/archive`)
  }

  unarchive(postId: PostId): Observable<UnArchivePostResponse> {
    return this.fetch.delete(`posts/${postId}/archive`)
  }

  updateInvolves(postId: PostId, members: UpdateInvolves): Observable<UpdateInvolvesResponse> {
    return this.fetch.put(`posts/${postId}/involveMembers`, members)
  }

  updatePin(postId: PostId, pin: boolean): Observable<UpdatePinResponse> {
    return this.fetch.put(`posts/${postId}/pin`, {
      pin: pin
    })
  }

  updateTags(postId: PostId, tagIds: TagId[]): Observable<UpdateTagsResponse> {
    return this.fetch.put(`posts/${postId}/tagIds`, {
      tagIds: tagIds
    })
  }

  move(postId: PostId, projectId: ProjectId): Observable<MovePostResponse> {
    return this.fetch.put(`posts/${postId}/move`, {
      _projectId: projectId
    })
  }

  fork(postId: PostId, projectId: ProjectId): Observable<PostData> {
    return this.fetch.put(`posts/${postId}/fork`, {
      _projectId: projectId
    })
  }
}

export default new PostFetch
