'use strict'
import { Observable, Observer } from 'rxjs'
import Post from '../schemas/Post'
import PostModel from '../models/PostModel'
import {
  default as PostFetch,
  CreatePostOptions,
  PostFavoriteResponse,
  UpdateInvolves
} from '../fetchs/PostFetch'
import { makeColdSignal, observableError, errorHandler } from './utils'

export class PostAPI {
  constructor() {
    PostModel.destructor()
  }

  getProjectPosts(projectId: string, query?: {
    page: number
    count: number
    fields?: string
  }): Observable<Post[]> {
    return makeColdSignal<Post[]>(observer => {
      const page = query && query.page ? query.page : 1
      const get = PostModel.getPosts(projectId, page)
      if (get) {
        return get
      }
      return Observable.fromPromise(PostFetch.getProjectPosts(projectId, query))
        .catch(err => errorHandler(observer, err))
        .concatMap(posts => PostModel.addPosts(projectId, posts, page))
    })
  }

  create(post: CreatePostOptions): Observable<Post> {
    return Observable.create((observer: Observer<Post>) => {
      return Observable.fromPromise(PostFetch.create(post))
        .catch(err => observableError(observer, err))
        .concatMap(post => PostModel.addOne(post))
    })
  }

  get(postId: string, query?: any): Observable<Post> {
    return makeColdSignal<Post>(observer => {
      const get = PostModel.getOne(postId)
      if (get) {
        return get
      }
      return Observable.fromPromise(PostFetch.get(postId, query))
        .catch(err => errorHandler(observer, err))
        .concatMap(post => PostModel.addOne(post))
    })
  }

  /**
   * cold signal
   */
  delete(postId: string): Observable<Post> {
    return Observable.create((observer: Observer<void>) => {
      Observable.fromPromise(PostFetch.delete(postId))
        .catch(err => observableError(observer, err))
        .concatMap(x => PostModel.delete(postId))
        .forEach(x => observer.next(null))
        .then(x => observer.complete())
    })
  }

  /**
   * cold signal
   */
  archive(postId: string): Observable<Post> {
    return Observable.create((observer: Observer<Post>) => {
      Observable.fromPromise(PostFetch.archive(postId))
        .catch(err => observableError(observer, err))
        .concatMap(post => PostModel.update<Post>(postId, post))
        .forEach(post => observer.next(post))
        .then(x => observer.complete())
    })
  }

  /**
   * cold signal
   */
  favorite(postId: string): Observable<Post> {
    return Observable.create((observer: Observer<PostFavoriteResponse>) => {
      Observable.fromPromise(PostFetch.favorite(postId))
        .catch(err => observableError(observer, err))
        .concatMap(result => PostModel.update(postId, {
          isFavorite: result.isFavorite,
          content: result.data.content,
          title: result.data.title,
          updated: result.data.updated,
          created: result.data.created
        }))
        .forEach(v => observer.next(<any>v))
        .then(x => observer.complete())
    })
  }

  /**
   * cold signal
   */
  like(postId: string): Observable<Post> {
    return Observable.create((observer: Observer<Post>) => {
      Observable.fromPromise(PostFetch.like(postId))
        .catch(err => observableError(observer, err))
        .concatMap(result => PostModel.update<Post>(postId, result))
        .forEach(r => observer.next(r))
        .then(x => observer.complete())
    })
  }

  /**
   * cold signal
   */
  dislike(postId: string): Observable<Post> {
    return Observable.create((observer: Observer<Post>) => {
      Observable.fromPromise(PostFetch.dislike(postId))
        .catch(err => observableError(observer, err))
        .concatMap(result => PostModel.update<Post>(postId, result))
        .forEach(r => observer.next(r))
        .then(x => observer.complete())
    })
  }

  /**
   * cold signal
   */
  unarchive(postId: string): Observable<Post> {
    return Observable.create((observer: Observer<Post>) => {
      Observable.fromPromise(PostFetch.unarchive(postId))
        .catch(err => observableError(observer, err))
        .concatMap(result => PostModel.update(postId, result))
        .forEach(r => observer.next(<Post>r))
        .then(x => observer.complete())
    })
  }

  /**
   * cold signal
   */
  updatInvolves(postId: string, involves: UpdateInvolves): Observable<Post> {
    return Observable.create((observer: Observer<Post>) => {
      Observable.fromPromise(PostFetch.updateInvolves(postId, involves))
        .catch(err => observableError(observer, err))
        .concatMap(result => PostModel.update<Post>(postId, result))
        .forEach(x => observer.next(x))
        .then(x => observer.complete())
    })
  }

  /**
   * cold signal
   */
  updatePin(postId: string, pin: boolean): Observable<Post> {
    return Observable.create((observer: Observer<Post>) => {
      Observable.fromPromise(PostFetch.updatePin(postId, pin))
        .catch(err => observableError(observer, err))
        .concatMap(post => PostModel.update<Post>(postId, post))
        .forEach(v => observer.next(v))
        .then(x => observer.complete())
    })
  }

  /**
   * cold signal
   */
  updateTags(postId: string, tagIds: string[]): Observable<Post> {
    return Observable.create((observer: Observer<Post>) => {
      Observable.fromPromise(PostFetch.updateTags(postId, tagIds))
        .catch(err => observableError(observer, err))
        .concatMap(r => PostModel.update<Post>(postId, r))
        .forEach(x => observer.next(x))
        .then(x => observer.complete())
    })
  }
}
