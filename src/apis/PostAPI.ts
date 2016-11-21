'use strict'
import { Observable } from 'rxjs/Observable'
import { PostData } from '../schemas/Post'
import PostModel from '../models/PostModel'
import {
  default as PostFetch,
  CreatePostOptions,
  MovePostResponse,
  UpdateInvolves,
  ArchivePostResponse,
  UnArchivePostResponse,
  UpdatePostOptions,
  UpdateInvolvesResponse,
  UpdatePinResponse,
  UpdateTagsResponse
} from '../fetchs/PostFetch'
import { makeColdSignal } from './utils'
import { PostId, ProjectId, UserId, TagId } from '../teambition'

export class PostAPI {
  getAllProjectPosts(projectId: ProjectId, query?: {
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
        .concatMap(posts =>
          PostModel.addPosts(projectId, posts, page)
        )
    })
  }

  getMyProjectPosts(userId: UserId, projectId: ProjectId, query?: {
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
        .concatMap(posts =>
          PostModel.addMyPosts(userId, projectId, posts, page)
        )
    })
  }

  getByTagId(tagId: TagId, query?: any): Observable<PostData[]> {
    return makeColdSignal<PostData[]>(() => {
      const page = query && query.page ? query.page : 1
      const cache = PostModel.getByTagId(tagId, page)
      if (cache) {
        return cache
      }
      return PostFetch.getByTagId(tagId, query)
        .concatMap(r =>
          PostModel.addByTagId(tagId, r, page)
        )
    })
  }

  create(post: CreatePostOptions): Observable<PostData> {
    return PostFetch.create(post)
      .concatMap(post =>
        PostModel.addOne(post)
          .take(1)
      )
  }

  get(postId: PostId, query?: any): Observable<PostData> {
    return makeColdSignal<PostData>(() => {
      const get = PostModel.getOne(postId)
      if (get && PostModel.checkSchema(<string>postId)) {
        return get
      }
      return PostFetch.get(postId, query)
        .concatMap(post =>
          PostModel.addOne(post)
        )
    })
  }

  /**
   * cold signal
   */
  delete(postId: PostId): Observable<void> {
    return PostFetch.delete(postId)
      .concatMap(x =>
        PostModel.delete(<string>postId)
      )
  }

  /**
   * cold signal
   */
  archive(postId: PostId): Observable<ArchivePostResponse> {
    return PostFetch.archive(postId)
      .concatMap(post =>
        PostModel.update(<string>postId, post)
      )
  }

  /**
   * cold signal
   */
  unarchive(postId: PostId): Observable<UnArchivePostResponse> {
    return PostFetch.unarchive(postId)
      .concatMap(result =>
        PostModel.update(<string>postId, result)
      )
  }

  update(postId: PostId, post: UpdatePostOptions): Observable<string> {
    return PostFetch.update(postId, post)
      .concatMap(result =>
        PostModel.update(<string>postId, result)
      )
  }

  /**
   * cold signal
   */
  updateInvolves(postId: PostId, involves: UpdateInvolves): Observable<UpdateInvolvesResponse> {
    return PostFetch.updateInvolves(postId, involves)
      .concatMap(result =>
        PostModel.update(<string>postId, result)
      )
  }

  /**
   * cold signal
   */
  updatePin(postId: PostId, pin: boolean): Observable<UpdatePinResponse> {
    return PostFetch.updatePin(postId, pin)
      .concatMap(post =>
        PostModel.update(<string>postId, post)
      )
  }

  /**
   * cold signal
   */
  updateTags(postId: PostId, tagIds: TagId[]): Observable<UpdateTagsResponse> {
    return PostFetch.updateTags(postId, tagIds)
      .concatMap(r =>
        PostModel.update(<string>postId, r)
      )
  }

  move(postId: PostId, projectId: ProjectId): Observable<MovePostResponse> {
    return PostFetch.move(postId, projectId)
      .concatMap(post =>
        PostModel.update(<string>postId, post)
      )
  }

  fork(postId: PostId, projectId: ProjectId): Observable<PostData> {
    return PostFetch.fork(postId, projectId)
      .concatMap(post =>
        PostModel.addOne(post)
          .take(1)
      )
  }
}

export default new PostAPI
