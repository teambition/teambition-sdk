'use strict'
import { Observable } from 'rxjs/Observable'
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
import { makeColdSignal } from './utils'

export class TagAPI {
  create(options: CreateTagOptions): Observable<TagData> {
    return TagFetch.create(options)
      .concatMap(r => TagModel.addOne(r).take(1))
  }

  get(_id: string, query?: any): Observable<TagData> {
    return makeColdSignal<TagData>(() => {
      const cache = TagModel.getOne(_id)
      if (cache) {
        return cache
      }
      return TagFetch.get(_id, query)
        .concatMap(r => TagModel.addOne(r))
    })
  }

  update(_id: string, options: UpdateTagOptions): Observable<UpdateTagResponse> {
    return TagFetch.update(_id, options)
      .concatMap(r => TagModel.update(_id, r))
  }

  delete(_id: string): Observable<void> {
    return TagFetch.delete(_id)
      .concatMap(() => TagModel.delete(_id))
  }

  archive(_id: string): Observable<ArchiveTagResponse> {
    return TagFetch.archive(_id)
      .concatMap(r => TagModel.update(_id, r))
  }

  unarchive(_id: string): Observable<ArchiveTagResponse> {
    return TagFetch.unarchive(_id)
      .concatMap(r => TagModel.update(_id, r))
  }

  getByProjectId(_projectId: string, query?: any): Observable<TagData[]> {
    return makeColdSignal<TagData[]>(() => {
      const cache = TagModel.getByProjectId(_projectId)
      if (cache) {
        return cache
      }
      return TagFetch.getByProjectId(_projectId, query)
        .concatMap(r => TagModel.addByProjectId(_projectId, r))
    })
  }

  getRelated<T extends ObjectSchema>(_tagId: string, objectType: TagsObjectType, query?: any): Observable<T[]> {
    return makeColdSignal<T[]>(() => {
      const cache = TagModel.getRelated<T>(_tagId, objectType)
      if (cache) {
        return cache
      }
      return TagFetch.getRelated<T>(_tagId, objectType, query)
        .concatMap(r => TagModel.addRelated(_tagId, objectType, r))
    })
  }

  relateTag(_objectId: string, objectType: TagsObjectType, tagId: string): Observable<RelateTagResponse> {
    return TagFetch.relateTag(_objectId, objectType, tagId)
      .concatMap(r => TagModel.relatedTag(_objectId, r))
  }
}

export default new TagAPI
