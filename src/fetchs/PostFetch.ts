'use strict'
import BaseFetch from './BaseFetch'
import { PostData } from '../schemas/Post'
import { visibility } from '../teambition'

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

export interface LikedResponse {
  isLiked: boolean,
  likeCount: number,
  likesGroup: {
    _id: string
    name: string
  }[]
}

export interface ArchivePostResponse {
  isArchived: boolean,
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
  create(post: CreatePostOptions): Promise<PostData> {
    return this.fetch.post(`posts`, post)
  }

  get(_postId: string, query?: any): Promise<PostData> {
    return this.fetch.get(`posts/${_postId}`, query)
  }

  getProjectPosts(_projectId: string, query?: {
    page: number
    count: number
    fields?: string
  }): Promise<PostData[]> {
    return this.fetch.get(`projects/${_projectId}/posts`, query)
  }

  update(postId: string, post: UpdatePostOptions): Promise<any> {
    return this.fetch.put(`posts/${postId}`, post)
  }

  delete(postId: string): Promise<void> {
    return this.fetch.delete<void>(`posts/${postId}`)
  }

  archive(postId: string): Promise<ArchivePostResponse> {
    return this.fetch.post(`posts/${postId}/archive`)
  }

  favorite(postId: string): Promise<PostFavoriteResponse> {
    return this.fetch.post(`posts/${postId}/favorite`)
  }

  like(postId: string): Promise<LikedResponse> {
    return this.fetch.post(`posts/${postId}/like`)
  }

  dislike(postId: string): Promise<LikedResponse> {
    return this.fetch.delete(`posts/${postId}/like`)
  }

  unarchive(postId: string): Promise<{
    isArchived: boolean
    updated: string
    _id: string
    _projectId: string
  }> {
    return this.fetch.delete(`posts/${postId}/archive`)
  }

  updateInvolves(postId: string, members: UpdateInvolves): Promise<UpdateInvolvesResponse> {
    return this.fetch.put(`posts/${postId}/involveMembers`, members)
  }

  updatePin(postId: string, pin: boolean): Promise<UpdatePinResponse> {
    return this.fetch.put(`posts/${postId}/pin`, {
      pin: pin
    })
  }

  updateTags(postId: string, tagIds: string[]): Promise<UpdateTagsResponse> {
    return this.fetch.put(`posts/${postId}/tagIds`, {
      tagIds: tagIds
    })
  }
}

export default new PostFetch()
