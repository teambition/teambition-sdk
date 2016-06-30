'use strict'
import { Observable, Observer } from 'rxjs'
import CollectionModel from '../models/CollectionModel'
import TBCollection from '../schemas/Collection'
import { default as CollectionFetch, CreateCollectionOptions, UpdateCollectionOptions } from '../fetchs/CollectionFetch'
import { makeColdSignal, errorHandler, observableError } from './utils'

export class CollectionAPI {
  constructor() {
    CollectionModel.destructor()
  }

  create(collection: CreateCollectionOptions): Observable<TBCollection> {
    return Observable.create((observer: Observer<TBCollection>) => {
      return Observable.fromPromise(CollectionFetch.create(collection))
        .catch(err => observableError(observer, err))
        .concatMap(collection => CollectionModel.addOne(collection))
        .forEach(r => observer.next(r))
    })
  }

  get(collectionId: string, query?: any): Observable<TBCollection> {
    return makeColdSignal<TBCollection>(observer => {
      const cache = CollectionModel.getOne(collectionId)
      if (cache) {
        return cache
      }
      return Observable.fromPromise(CollectionFetch.get(collectionId, query))
        .catch(err => errorHandler(observer, err))
        .concatMap(r => CollectionModel.addOne(r))
    })
  }

  update(collectionId: string, info: UpdateCollectionOptions): Observable<TBCollection> {
    return Observable.create((observer: Observer<TBCollection>) => {
      return Observable.fromPromise(CollectionFetch.update(collectionId, info))
        .catch(err => observableError(observer, err))
        .concatMap(r => CollectionModel.update<TBCollection>(collectionId, r))
        .forEach(r => observer.next(r))
    })
  }

  delete(collectionId: string): Observable<void> {
    return Observable.create((observer: Observer<void>) => {
      return Observable.fromPromise(CollectionFetch.delete(collectionId))
        .catch(err => observableError(observer, err))
        .concatMap(r => CollectionModel.delete(collectionId))
        .forEach(r => observer.next(r))
    })
  }

  archive(collectionId: string): Observable<TBCollection> {
    return Observable.create((observer: Observer<TBCollection>) => {
      return Observable.fromPromise(CollectionFetch.archive(collectionId))
        .catch(err => observableError(observer, err))
        .concatMap(r => CollectionModel.update<TBCollection>(collectionId, r))
        .forEach(r => observer.next(r))
    })
  }

  getByParent(parentId: string, query?: any): Observable<TBCollection[]> {
    return makeColdSignal<TBCollection[]>(observer => {
      const cache = CollectionModel.getCollections(parentId)
      if (cache) {
        return cache
      }
      return Observable.fromPromise(CollectionFetch.getByParent(parentId))
        .catch(err => errorHandler(observer, err))
        .concatMap(r => CollectionModel.addCollections(parentId, r))
    })
  }

  move(collectionId: string, parentId: string): Observable<TBCollection> {
    return Observable.create((observer: Observer<TBCollection>) => {
      return Observable.fromPromise(CollectionFetch.move(collectionId, parentId))
        .catch(err => observableError(observer, err))
        .concatMap(r => CollectionModel.update<TBCollection>(collectionId, r))
        .forEach(r => observer.next(r))
    })
  }

  unarchive(collectionId: string): Observable<TBCollection> {
    return Observable.create((observer: Observer<TBCollection>) => {
      return Observable.fromPromise(CollectionFetch.unarchive(collectionId))
        .catch(err => observableError(observer, err))
        .concatMap(r => CollectionModel.update<TBCollection>(collectionId, r))
        .forEach(r => observer.next(r))
    })
  }
}
