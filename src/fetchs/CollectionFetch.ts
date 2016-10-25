'use strict'
import { Observable } from 'rxjs/Observable'
import BaseFetch from './BaseFetch'
import { TBCollectionData } from '../schemas/Collection'
import { assign } from '../utils/index'
import { CollectionId, DefaultColors, ProjectId } from '../teambition'

export interface CreateCollectionOptions {
  title: string
  _parentId: CollectionId
  description?: string
  color?: DefaultColors
}

export interface UpdateCollectionOptions {
  title?: string
  description?: string
  color?: DefaultColors
}

export interface UnarchiveCollectionResponse {
  isArchived: boolean
  updated: string
  _id: CollectionId
  _projectId: ProjectId
}

export interface ArchiveCollectionResponse {
  isArchived: boolean
  updated: string
  _id: CollectionId
  _projectId: ProjectId
}

export class CollectionFetch extends BaseFetch {
  create(collection: CreateCollectionOptions): Observable<TBCollectionData> {
    return this.fetch.post(`collections`, collection)
  }

  get(collectionId: CollectionId, query?: any): Observable<TBCollectionData> {
    return this.fetch.get(`collections/${collectionId}`, query)
  }

  update(collectionId: CollectionId, info: UpdateCollectionOptions): Observable<any> {
    return this.fetch.put(`collections/${collectionId}`, info)
  }

  delete(collectionId: CollectionId): Observable<void> {
    return this.fetch.delete<void>(`collections/${collectionId}`)
  }

  archive(collectionId: CollectionId): Observable<ArchiveCollectionResponse> {
    return this.fetch.post(`collections/${collectionId}/archive`)
  }

  getByParent(parentId: CollectionId, query?: any): Observable<TBCollectionData[]> {
    return this.fetch.get(`collections`, assign({
      _parentId: parentId
    }, query))
  }

  move(collectionId: CollectionId, parentId: CollectionId): Observable<TBCollectionData> {
    return this.fetch.put(`collections/${collectionId}/move`, {
      _parentId: parentId
    })
  }

  unarchive(collectionId: CollectionId): Observable<UnarchiveCollectionResponse> {
    return this.fetch.delete(`collections/${collectionId}/archive`)
  }
}

export default new CollectionFetch
