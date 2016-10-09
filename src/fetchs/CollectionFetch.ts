'use strict'
import { Observable } from 'rxjs/Observable'
import BaseFetch from './BaseFetch'
import { TBCollectionData } from '../schemas/Collection'
import { assign } from '../utils/index'

export interface CreateCollectionOptions {
  title: string
  _parentId: string
  description?: string
  color?: string
}

export interface UpdateCollectionOptions {
  title?: string
  description?: string
  color?: string
}

export interface UnarchiveCollectionResponse {
  isArchived: boolean
  updated: string
  _id: string
  _projectId: string
}

export interface ArchiveCollectionResponse {
  isArchived: boolean
  updated: string
  _id: string
  _projectId: string
}

export class CollectionFetch extends BaseFetch {
  create(collection: CreateCollectionOptions): Observable<TBCollectionData> {
    return this.fetch.post(`collections`, collection)
  }

  get(collectionId: string, query?: any): Observable<TBCollectionData> {
    return this.fetch.get(`collections/${collectionId}`, query)
  }

  update(collectionId: string, info: UpdateCollectionOptions): Observable<any> {
    return this.fetch.put(`collections/${collectionId}`, info)
  }

  delete(collectionId: string): Observable<void> {
    return this.fetch.delete<void>(`collections/${collectionId}`)
  }

  archive(collectionId: string): Observable<ArchiveCollectionResponse> {
    return this.fetch.post(`collections/${collectionId}/archive`)
  }

  getByParent(parentId: string, query?: any): Observable<TBCollectionData[]> {
    return this.fetch.get(`collections`, assign({
      _parentId: parentId
    }, query))
  }

  move(collectionId: string, parentId: string): Observable<TBCollectionData> {
    return this.fetch.put(`collections/${collectionId}/move`, {
      _parentId: parentId
    })
  }

  unarchive(collectionId: string): Observable<UnarchiveCollectionResponse> {
    return this.fetch.delete(`collections/${collectionId}/archive`)
  }
}

export default new CollectionFetch()
