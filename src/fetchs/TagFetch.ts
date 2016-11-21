'use strict'
import { Observable } from 'rxjs/Observable'
import BaseFetch from './BaseFetch'
import { TagData } from '../schemas/Tag'
import { TaskData } from '../schemas/Task'
import { EventData } from '../schemas/Event'
import { PostData } from '../schemas/Post'
import { FileData } from '../schemas/File'
import { EntryData } from '../schemas/Entry'
import {
  DefaultColors,
  DetailObjectType,
  DetailObjectId,
  TagId,
  ProjectId,
  UserId
} from '../teambition'

export type ObjectSchema = EntryData | FileData | PostData | EventData | TaskData

export interface CreateTagOptions {
  _projectId: ProjectId
  color?: DefaultColors
}

export interface UpdateTagOptions {
  name?: string
  color?: DefaultColors
}

export interface UpdateTagResponse {
  _id: TagId
  _projectId: ProjectId
  name: string
  _creatorId: UserId
  updated: string
  created: string
  isArchived: boolean
  color: DefaultColors
}

export interface RelateTagResponse {
  tagIds: TagId[]
}

export interface ArchiveTagResponse {
  isArchived: boolean
  updated: string
  _id: TagId
  _projectId: ProjectId
}

export interface UnarchiveTagResponse {
  isArchived: boolean
  updated: string
  _id: TagId
  _projectId: ProjectId
}

export class TagFetch extends BaseFetch {
  create(options: CreateTagOptions): Observable<TagData> {
    return this.fetch.post(`tags`, options)
  }

  get(_id: TagId, query?: any): Observable<TagData> {
    return this.fetch.get(`tags/${_id}`, query)
  }

  update(_id: TagId, option: UpdateTagOptions): Observable<UpdateTagResponse> {
    return this.fetch.put(`tags/${_id}`, option)
  }

  delete(_id: TagId): Observable<void> {
    return this.fetch.delete<void>(`tags/${_id}`)
  }

  archive(_id: TagId): Observable<ArchiveTagResponse> {
    return this.fetch.post(`tags/${_id}/archive`)
  }

  unarchive(_id: TagId): Observable<UnarchiveTagResponse> {
    return this.fetch.delete(`tags/${_id}/archive`)
  }

  getByObject(_objectId: DetailObjectId, objectType: DetailObjectType, query?: any): Observable<TagData[]> {
    return this.fetch.get(`tags/${objectType}s/${_objectId}/tags`, query)
  }

  getByProjectId(_projectId: ProjectId, query?: any): Observable<TagData[]> {
    return this.fetch.get(`projects/${_projectId}/tags`, query)
  }

  getRelated<T extends ObjectSchema>(_tagId: TagId, objectType: DetailObjectType, query?: any): Observable<T[]> {
    return this.fetch.get(`tags/${_tagId}/${objectType}s`)
  }

  relateTag(_objectId: DetailObjectId, objectType: DetailObjectType, tagId: TagId): Observable<RelateTagResponse> {
    return this.fetch.put(`${objectType}s/${_objectId}/tags/${tagId}`)
  }
}

export default new TagFetch
