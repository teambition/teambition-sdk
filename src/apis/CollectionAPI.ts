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
import { CollectionId } from '../teambition'

export class CollectionAPI {
  create(collection: CreateCollectionOptions): Observable<TBCollectionData> {
    return CollectionFetch.create(collection)
      .concatMap(collection => CollectionModel.addOne(collection).take(1))
  }

  get(collectionId: CollectionId, query?: any): Observable<TBCollectionData> {
    return makeColdSignal<TBCollectionData>(() => {
      const cache = CollectionModel.getOne(collectionId)
      if (cache) {
        return cache
      }
      return CollectionFetch.get(collectionId, query)
        .concatMap(r => CollectionModel.addOne(r))
    })
  }

  update(collectionId: CollectionId, info: UpdateCollectionOptions): Observable<TBCollectionData> {
    return CollectionFetch.update(collectionId, info)
      .concatMap(r => CollectionModel.update<TBCollectionData>(<string>collectionId, r))
  }

  delete(collectionId: CollectionId): Observable<void> {
    return CollectionFetch.delete(collectionId)
      .concatMap(r => CollectionModel.delete(<string>collectionId))
  }

  archive(collectionId: CollectionId): Observable<ArchiveCollectionResponse> {
    return CollectionFetch.archive(collectionId)
      .concatMap(r => CollectionModel.update(<string>collectionId, r))
  }

  getByParent(parentId: CollectionId, query?: any): Observable<TBCollectionData[]> {
    return makeColdSignal<TBCollectionData[]>(() => {
      const cache = CollectionModel.getCollections(parentId)
      if (cache) {
        return cache
      }
      return CollectionFetch.getByParent(parentId)
        .concatMap(r => CollectionModel.addCollections(parentId, r))
    })
  }

  move(collectionId: CollectionId, parentId: CollectionId): Observable<TBCollectionData> {
    return CollectionFetch.move(collectionId, parentId)
      .concatMap(r => CollectionModel.update<TBCollectionData>(<string>collectionId, r))
  }

  unarchive(collectionId: CollectionId): Observable<UnarchiveCollectionResponse> {
    return CollectionFetch.unarchive(collectionId)
      .concatMap(r => CollectionModel.update(<string>collectionId, r))
  }
}

export default new CollectionAPI
