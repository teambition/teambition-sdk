'use strict'
import { Observable } from 'rxjs/Observable'
import { Observer } from 'rxjs/Observer'
import TagModel from '../models/TagModel'
import TagFetch, {
  CreateTagOptions,
  UpdateTagOptions,
  UpdateTagResponse,
  ArchiveTagResponse,
  TagsObjectType,
  ObjectSchema,
  RelateTagResponse
} from '../fetchs/TagFetch'
import { TagData } from '../schemas/Tag'
import { errorHandler, observableError, makeColdSignal } from './utils'

export class TagAPI {
  create(options: CreateTagOptions): Observable<TagData> {
    return Observable.create((observer: Observer<TagData>) => {
      Observable.fromPromise(TagFetch.create(options))
        .catch(err => observableError(observer, err))
        .concatMap(r => TagModel.addOne(r))
        .forEach(r => observer.next(r))
        .then(() => observer.complete())
    })
  }

  get(_id: string, query?: any): Observable<TagData> {
    return makeColdSignal<TagData>(observer => {
      const cache = TagModel.getOne(_id)
      if (cache) {
        return cache
      }
      return Observable.fromPromise(TagFetch.get(_id, query))
        .catch(err => errorHandler(observer, err))
        .concatMap(r => TagModel.addOne(r))
    })
  }

  update(_id: string, options: UpdateTagOptions): Observable<UpdateTagResponse> {
    return Observable.create((observer: Observer<UpdateTagResponse>) => {
      Observable.fromPromise(TagFetch.update(_id, options))
        .catch(err => observableError(observer, err))
        .concatMap(r => TagModel.update(_id, r))
        .forEach(r => observer.next(r))
        .then(() => observer.complete())
    })
  }

  delete(_id: string): Observable<void> {
    return Observable.create((observer: Observer<void>) => {
      Observable.fromPromise(TagFetch.delete(_id))
        .catch(err => observableError(observer, err))
        .concatMap(() => TagModel.delete(_id))
        .forEach(() => observer.next(null))
        .then(() => observer.complete())
    })
  }

  archive(_id: string): Observable<ArchiveTagResponse> {
    return Observable.create((observer: Observer<ArchiveTagResponse>) => {
      Observable.fromPromise(TagFetch.archive(_id))
        .catch(err => observableError(observer, err))
        .concatMap(r => TagModel.update(_id, r))
        .forEach(r => observer.next(r))
        .then(() => observer.complete())
    })
  }

  unarchive(_id: string): Observable<ArchiveTagResponse> {
    return Observable.create((observer: Observer<ArchiveTagResponse>) => {
      Observable.fromPromise(TagFetch.unarchive(_id))
        .catch(err => observableError(observer, err))
        .concatMap(r => TagModel.update(_id, r))
        .forEach(r => observer.next(r))
        .then(() => observer.complete())
    })
  }

  /**
   * 无法解决同步的问题，先不实现这个接口，有更简单自然的用法
   */
  // getByObject(_objectId: string, objectType: TagsObjectType, query?: any): Observable<TagData[]> {
  //   return makeColdSignal<TagData[]>(observer => {
  //     const cache = TagModel.getByObject(_objectId, objectType)
  //     if (cache) {
  //       return cache
  //     }
  //     return Observable.fromPromise(TagFetch.getByObject(_objectId, objectType, query))
  //       .catch(err => errorHandler(observer, err))
  //       .concatMap(r => TagModel.addByObject(_objectId, objectType, r))
  //   })
  // }

  getByProjectId(_projectId: string, query?: any): Observable<TagData[]> {
    return makeColdSignal<TagData[]>(observer => {
      const cache = TagModel.getByProjectId(_projectId)
      if (cache) {
        return cache
      }
      return Observable.fromPromise(TagFetch.getByProjectId(_projectId, query))
        .catch(err => errorHandler(observer, err))
        .concatMap(r => TagModel.addByProjectId(_projectId, r))
    })
  }

  getRelated<T extends ObjectSchema>(_tagId: string, objectType: TagsObjectType, query?: any): Observable<T[]> {
    return makeColdSignal<T[]>(observer => {
      const cache = TagModel.getRelated<T>(_tagId, objectType)
      if (cache) {
        return cache
      }
      return Observable.fromPromise(TagFetch.getRelated(_tagId, objectType, query))
        .catch(err => errorHandler(observer, err))
        .concatMap(r => TagModel.addRelated(_tagId, objectType, r))
    })
  }

  relateTag(_objectId: string, objectType: TagsObjectType, tagId: string): Observable<RelateTagResponse> {
    return Observable.create((observer: Observer<RelateTagResponse>) => {
      Observable.fromPromise(TagFetch.relateTag(_objectId, objectType, tagId))
        .catch(err => observableError(observer, err))
        .concatMap(r => TagModel.relatedTag(_objectId, r))
        .forEach(r => observer.next(r))
        .then(() => observer.complete())
    })
  }
}
