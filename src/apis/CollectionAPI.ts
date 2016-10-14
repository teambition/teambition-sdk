'use strict'
import { Observable } from 'rxjs/Observable'
import CollectionModel from '../models/CollectionModel'
import { TBCollectionData } from '../schemas/Collection'
import {
  default as CollectionFetch,
  CreateCollectionOptions,
  UpdateCollectionOptions,
  ArchiveCollectionResponse,
  UnarchiveCollectionResponse
} from '../fetchs/CollectionFetch'
import { makeColdSignal } from './utils'

export class CollectionAPI {
  create(collection: CreateCollectionOptions): Observable<TBCollectionData> {
    return CollectionFetch.create(collection)
      .concatMap(collection => CollectionModel.addOne(collection).take(1))
  }

  get(collectionId: string, query?: any): Observable<TBCollectionData> {
    return makeColdSignal<TBCollectionData>(() => {
      const cache = CollectionModel.getOne(collectionId)
      if (cache) {
        return cache
      }
      return CollectionFetch.get(collectionId, query)
        .concatMap(r => CollectionModel.addOne(r))
    })
  }

  update(collectionId: string, info: UpdateCollectionOptions): Observable<TBCollectionData> {
    return CollectionFetch.update(collectionId, info)
      .concatMap(r => CollectionModel.update<TBCollectionData>(collectionId, r))
  }

  delete(collectionId: string): Observable<void> {
    return CollectionFetch.delete(collectionId)
      .concatMap(r => CollectionModel.delete(collectionId))
  }

  archive(collectionId: string): Observable<ArchiveCollectionResponse> {
    return CollectionFetch.archive(collectionId)
      .concatMap(r => CollectionModel.update(collectionId, r))
  }

  getByParent(parentId: string, query?: any): Observable<TBCollectionData[]> {
    return makeColdSignal<TBCollectionData[]>(() => {
      const cache = CollectionModel.getCollections(parentId)
      if (cache) {
        return cache
      }
      return CollectionFetch.getByParent(parentId)
        .concatMap(r => CollectionModel.addCollections(parentId, r))
    })
  }

  move(collectionId: string, parentId: string): Observable<TBCollectionData> {
    return CollectionFetch.move(collectionId, parentId)
      .concatMap(r => CollectionModel.update<TBCollectionData>(collectionId, r))
  }

  unarchive(collectionId: string): Observable<UnarchiveCollectionResponse> {
    return CollectionFetch.unarchive(collectionId)
      .concatMap(r => CollectionModel.update(collectionId, r))
  }
}

export default new CollectionAPI
