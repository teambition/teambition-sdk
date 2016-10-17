'use strict'
import { Observable } from 'rxjs/Observable'
import BaseFetch from './BaseFetch'
import { PostData } from '../schemas/Post'
import { visibility } from '../teambition'

export type ProjectPostType = 'all' | 'my'

export interface CreatePostOptions {
  _projectId: string
  title: string
  content: string
  postMode?: 'html' | 'txt'
  visiable?: visibility
  attachments?: string[]
  involveMembers?: string[]
  tagIds?: string[]
}

export interface UpdatePostOptions {
  title?: string
  content?: string
  postMode?: 'html' | 'txt'
  pin?: boolean
  attachments?: string[]
  involveMembers?: string[]
}

export interface PostFavoriteResponse {
  isFavorite: boolean
  isUpdated: boolean
  isVisible: boolean
  refType: 'post'
  created: string
  updated: string
  creator: {
    _id: string
    name: string
    avatarUrl: string
  }
  project: {
    _id: string
    name: string
  }
  data: {
    created: string
    updated: string
    content: string
    title: string
  }
  _refId: string
  _creatorId: string
  _id: string
}

export type UpdateInvolves = {
  involveMembers: string[]
} | {
  addInvolvers?: string[]
  delInvolvers?: string[]
}

export interface ArchivePostResponse {
  isArchived: boolean,
  updated: string
  _id: string
  _projectId: string
}

export interface UnArchivePostResponse {
  isArchived: boolean
  updated: string
  _id: string
  _projectId: string
}

export interface UpdateInvolvesResponse {
  _id: string
  involveMembers: string[]
  updated: string
}

export interface UpdatePinResponse {
  _id: string
  pin: boolean
  updated: string
}

export interface UpdateTagsResponse {
  _id: string
  tagIds: string[]
  updated: string
}

export class PostFetch extends BaseFetch {
  create(post: CreatePostOptions): Observable<PostData> {
    return this.fetch.post(`posts`, post)
  }

  get(_postId: string, query?: any): Observable<PostData> {
    return this.fetch.get(`posts/${_postId}`, query)
  }

  getProjectPosts(_projectId: string, type: ProjectPostType, query?: {
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

  update(postId: string, post: UpdatePostOptions): Observable<any> {
    return this.fetch.put(`posts/${postId}`, post)
  }

  delete(postId: string): Observable<void> {
    return this.fetch.delete<void>(`posts/${postId}`)
  }

  archive(postId: string): Observable<ArchivePostResponse> {
    return this.fetch.post(`posts/${postId}/archive`)
  }

  favorite(postId: string): Observable<PostFavoriteResponse> {
    return this.fetch.post(`posts/${postId}/favorite`)
  }

  unarchive(postId: string): Observable<UnArchivePostResponse> {
    return this.fetch.delete(`posts/${postId}/archive`)
  }

  updateInvolves(postId: string, members: UpdateInvolves): Observable<UpdateInvolvesResponse> {
    return this.fetch.put(`posts/${postId}/involveMembers`, members)
  }

  updatePin(postId: string, pin: boolean): Observable<UpdatePinResponse> {
    return this.fetch.put(`posts/${postId}/pin`, {
      pin: pin
    })
  }

  updateTags(postId: string, tagIds: string[]): Observable<UpdateTagsResponse> {
    return this.fetch.put(`posts/${postId}/tagIds`, {
      tagIds: tagIds
    })
  }
}

export default new PostFetch()
