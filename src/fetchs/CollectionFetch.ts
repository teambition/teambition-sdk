'use strict'
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
  create(collection: CreateCollectionOptions): Promise<TBCollectionData> {
    return this.fetch.post(`collections`, collection)
  }

  get(collectionId: string, query?: any): Promise<TBCollectionData> {
    return this.fetch.get(`collections/${collectionId}`, query)
  }

  update(collectionId: string, info: UpdateCollectionOptions): Promise<any> {
    return this.fetch.put(`collections/${collectionId}`, info)
  }

  delete(collectionId: string): Promise<void> {
    return this.fetch.delete<void>(`collections/${collectionId}`)
  }

  archive(collectionId: string): Promise<ArchiveCollectionResponse> {
    return this.fetch.post(`collections/${collectionId}/archive`)
  }

  getByParent(parentId: string, query?: any): Promise<TBCollectionData[]> {
    return this.fetch.get(`collections`, assign({
      _parentId: parentId
    }, query))
  }

  move(collectionId: string, parentId: string): Promise<TBCollectionData> {
    return this.fetch.put(`collections/${collectionId}/move`, {
      _parentId: parentId
    })
  }

  unarchive(collectionId: string): Promise<UnarchiveCollectionResponse> {
    return this.fetch.delete(`collections/${collectionId}/archive`)
  }
}

export default new CollectionFetch()
