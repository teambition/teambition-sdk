'use strict'
import { Observable } from 'rxjs/Observable'
import { PostData } from '../schemas/Post'
import PostModel from '../models/PostModel'
import {
  default as PostFetch,
  CreatePostOptions,
  MovePostResponse,
  PostFavoriteResponse,
  UpdateInvolves,
  ArchivePostResponse,
  UnArchivePostResponse,
  UpdatePostOptions,
  UpdateInvolvesResponse,
  UpdatePinResponse,
  UpdateTagsResponse
} from '../fetchs/PostFetch'
import { makeColdSignal } from './utils'

export class PostAPI {
  getAllProjectPosts(projectId: string, query?: {
    page: number
    count: number
    fields?: string
    [index: string]: any
  }): Observable<PostData[]> {
    return makeColdSignal<PostData[]>(() => {
      const page = query && query.page ? query.page : 1
      const get = PostModel.getPosts(projectId, page)
      if (get) {
        return get
      }
      return PostFetch.getProjectPosts(projectId, 'all', query)
        .concatMap(posts => PostModel.addPosts(projectId, posts, page))
    })
  }

  getMyProjectPosts(userId: string, projectId: string, query?: {
    page: number
    count: number
    fields?: string
    [index: string]: any
  }): Observable<PostData[]> {
    return makeColdSignal<PostData[]>(() => {
      const page = query && query.page ? query.page : 1
      const get = PostModel.getMyPosts(projectId, page)
      if (get) {
        return get
      }
      return PostFetch.getProjectPosts(projectId, 'my', query)
        .concatMap(posts => PostModel.addMyPosts(userId, projectId, posts, page))
    })
  }

  getByTagId(tagId: string, query?: any): Observable<PostData[]> {
    return makeColdSignal<PostData[]>(() => {
      const page = query && query.page ? query.page : 1
      const cache = PostModel.getByTagId(tagId, page)
      if (cache) {
        return cache
      }
      return PostFetch.getByTagId(tagId, query)
        .concatMap(r => PostModel.addByTagId(tagId, r, page))
    })
  }

  create(post: CreatePostOptions): Observable<PostData> {
    return PostFetch.create(post)
      .concatMap(post => PostModel.addOne(post).take(1))
  }

  get(postId: string, query?: any): Observable<PostData> {
    return makeColdSignal<PostData>(() => {
      const get = PostModel.getOne(postId)
      if (get && PostModel.checkSchema(postId)) {
        return get
      }
      return PostFetch.get(postId, query)
        .concatMap(post => PostModel.addOne(post))
    })
  }

  /**
   * cold signal
   */
  delete(postId: string): Observable<void> {
    return PostFetch.delete(postId)
      .concatMap(x => PostModel.delete(postId))
  }

  /**
   * cold signal
   */
  archive(postId: string): Observable<ArchivePostResponse> {
    return PostFetch.archive(postId)
      .concatMap(post => PostModel.update(postId, post))
  }

  /**
   * cold signal
   */
  favorite(postId: string): Observable<PostFavoriteResponse> {
    return PostFetch.favorite(postId)
      .concatMap(result => {
        return PostModel.update(postId, {
          isFavorite: result.isFavorite,
          content: result.data.content,
          title: result.data.title,
          updated: result.data.updated,
          created: result.data.created
        })
          .map(() => result)
      })
  }

  /**
   * cold signal
   */
  unarchive(postId: string): Observable<UnArchivePostResponse> {
    return PostFetch.unarchive(postId)
      .concatMap(result => PostModel.update(postId, result))
  }

  update(postId: string, post: UpdatePostOptions): Observable<any> {
    return PostFetch.update(postId, post)
      .concatMap(result => PostModel.update(postId, result))
  }

  /**
   * cold signal
   */
  updateInvolves(postId: string, involves: UpdateInvolves): Observable<UpdateInvolvesResponse> {
    return PostFetch.updateInvolves(postId, involves)
      .concatMap(result => PostModel.update(postId, result))
  }

  /**
   * cold signal
   */
  updatePin(postId: string, pin: boolean): Observable<UpdatePinResponse> {
    return PostFetch.updatePin(postId, pin)
      .concatMap(post => PostModel.update(postId, post))
  }

  /**
   * cold signal
   */
  updateTags(postId: string, tagIds: string[]): Observable<UpdateTagsResponse> {
    return PostFetch.updateTags(postId, tagIds)
      .concatMap(r => PostModel.update(postId, r))
  }

  move(postId: string, projectId: string): Observable<MovePostResponse> {
    return PostFetch.move(postId, projectId)
      .concatMap(post => PostModel.update(postId, post))
  }

  fork(postId: string, projectId: string): Observable<PostData> {
    return PostFetch.fork(postId, projectId)
      .concatMap(post => PostModel.addOne(post).take(1))
  }
}

export default new PostAPI
