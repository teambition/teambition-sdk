'use strict'
import { Observable } from 'rxjs/Observable'
import TagModel from '../models/TagModel'
import TagFetch, {
  CreateTagOptions,
  UpdateTagOptions,
  UpdateTagResponse,
  ArchiveTagResponse,
  ObjectSchema,
  RelateTagResponse
} from '../fetchs/TagFetch'
import { TagData } from '../schemas/Tag'
import { makeColdSignal } from './utils'
import { TagId, ProjectId, DetailObjectId, DetailObjectType, TagType, OrganizationId } from '../teambition'

export class TagAPI {
  create(options: CreateTagOptions): Observable<TagData> {
    return TagFetch.create(options)
      .concatMap(r =>
        TagModel.addOne(r)
          .take(1)
      )
  }

  get(_id: TagId, query?: any): Observable<TagData> {
    return makeColdSignal<TagData>(() => {
      const cache = TagModel.getOne(_id)
      if (cache) {
        return cache
      }
      return TagFetch.get(_id, query)
        .concatMap(r =>
          TagModel.addOne(r)
        )
    })
  }

  update(_id: TagId, options: UpdateTagOptions): Observable<UpdateTagResponse> {
    return TagFetch.update(_id, options)
      .concatMap(r =>
        TagModel.update(<string>_id, r)
      )
  }

  delete(_id: TagId): Observable<void> {
    return TagFetch.delete(_id)
      .concatMap(() =>
        TagModel.delete(<string>_id)
      )
  }

  archive(_id: TagId): Observable<ArchiveTagResponse> {
    return TagFetch.archive(_id)
      .concatMap(r =>
        TagModel.update(<string>_id, r)
      )
  }

  unarchive(_id: TagId): Observable<ArchiveTagResponse> {
    return TagFetch.unarchive(_id)
      .concatMap(r =>
        TagModel.update(<string>_id, r)
      )
  }

  getTags(objectId: ProjectId, tagType: TagType.project): Observable<TagData[]>
  getTags(objectId: OrganizationId, tagType: TagType.organization): Observable<TagData[]>
  getTags(objectId: ProjectId | OrganizationId, tagType: TagType): Observable<TagData[]>

  getTags(objectId: ProjectId | OrganizationId, tagType: TagType): Observable<TagData[]> {
    return makeColdSignal(() => {
      const cache = TagModel.getTags(objectId, tagType)
      if (cache) return cache
      return TagFetch.getTags(objectId, tagType)
        .concatMap((tags) => {
          return TagModel.saveTags(objectId, tagType, tags)
        })
    })
  }

  getRelated<T extends ObjectSchema>(
    _tagId: TagId,
    objectType: DetailObjectType,
    query?: any
  ): Observable<T[]> {
    return makeColdSignal<T[]>(() => {
      const cache = TagModel.getRelated<T>(_tagId, objectType)
      if (cache) {
        return cache
      }
      return TagFetch.getRelated<T>(_tagId, objectType, query)
        .concatMap(r =>
          TagModel.addRelated(_tagId, objectType, r)
        )
    })
  }

  relateTag(
    _objectId: DetailObjectId,
    objectType: DetailObjectType,
    tagId: TagId
  ): Observable<RelateTagResponse> {
    return TagFetch.relateTag(_objectId, objectType, tagId)
      .concatMap(r =>
        TagModel.relatedTag(_objectId, r)
      )
  }
}

export default new TagAPI
