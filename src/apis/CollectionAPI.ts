'use strict'
import { Observable } from 'rxjs/Observable'
import { Observer } from 'rxjs/Observer'
import CollectionModel from '../models/CollectionModel'
import { TBCollectionData } from '../schemas/Collection'
import {
  default as CollectionFetch,
  CreateCollectionOptions,
  UpdateCollectionOptions,
  UnarchiveCollectionResponse,
  ArchiveCollectionResponse
} from '../fetchs/CollectionFetch'
import { makeColdSignal, errorHandler, observableError } from './utils'

export class CollectionAPI {
  constructor() {
    CollectionModel.destructor()
  }

  create(collection: CreateCollectionOptions): Observable<TBCollectionData> {
    return Observable.create((observer: Observer<TBCollectionData>) => {
      Observable.fromPromise(CollectionFetch.create(collection))
        .catch(err => observableError(observer, err))
        .concatMap(collection => CollectionModel.addOne(collection).take(1))
        .forEach(r => observer.next(r))
        .then(() => observer.complete())
    })
  }

  get(collectionId: string, query?: any): Observable<TBCollectionData> {
    return makeColdSignal<TBCollectionData>(observer => {
      const cache = CollectionModel.getOne(collectionId)
      if (cache) {
        return cache
      }
      return Observable.fromPromise(CollectionFetch.get(collectionId, query))
        .catch(err => errorHandler(observer, err))
        .concatMap(r => CollectionModel.addOne(r))
    })
  }

  update(collectionId: string, info: UpdateCollectionOptions): Observable<TBCollectionData> {
    return Observable.create((observer: Observer<TBCollectionData>) => {
      Observable.fromPromise(CollectionFetch.update(collectionId, info))
        .catch(err => observableError(observer, err))
        .concatMap(r => CollectionModel.update<TBCollectionData>(collectionId, r))
        .forEach(r => observer.next(r))
        .then(() => observer.complete())
    })
  }

  delete(collectionId: string): Observable<void> {
    return Observable.create((observer: Observer<void>) => {
      Observable.fromPromise(CollectionFetch.delete(collectionId))
        .catch(err => observableError(observer, err))
        .concatMap(r => CollectionModel.delete(collectionId))
        .forEach(r => observer.next(r))
        .then(() => observer.complete())
    })
  }

  archive(collectionId: string): Observable<ArchiveCollectionResponse> {
    return Observable.create((observer: Observer<ArchiveCollectionResponse>) => {
      Observable.fromPromise(CollectionFetch.archive(collectionId))
        .catch(err => observableError(observer, err))
        .concatMap(r => CollectionModel.update(collectionId, r))
        .forEach(r => observer.next(r))
        .then(() => observer.complete())
    })
  }

  getByParent(parentId: string, query?: any): Observable<TBCollectionData[]> {
    return makeColdSignal<TBCollectionData[]>(observer => {
      const cache = CollectionModel.getCollections(parentId)
      if (cache) {
        return cache
      }
      return Observable.fromPromise(CollectionFetch.getByParent(parentId))
        .catch(err => errorHandler(observer, err))
        .concatMap(r => CollectionModel.addCollections(parentId, r))
    })
  }

  move(collectionId: string, parentId: string): Observable<TBCollectionData> {
    return Observable.create((observer: Observer<TBCollectionData>) => {
      Observable.fromPromise(CollectionFetch.move(collectionId, parentId))
        .catch(err => observableError(observer, err))
        .concatMap(r => CollectionModel.update<TBCollectionData>(collectionId, r))
        .forEach(r => observer.next(r))
        .then(() => observer.complete())
    })
  }

  unarchive(collectionId: string) {
    return Observable.create((observer: Observer<UnarchiveCollectionResponse>) => {
      Observable.fromPromise(CollectionFetch.unarchive(collectionId))
        .catch(err => observableError(observer, err))
        .concatMap(r => CollectionModel.update(collectionId, r))
        .forEach(r => observer.next(r))
        .then(() => observer.complete())
    })
  }
}
