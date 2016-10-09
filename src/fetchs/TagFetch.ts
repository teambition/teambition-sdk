'use strict'
import { Observable } from 'rxjs/Observable'
import BaseFetch from './BaseFetch'
import { TagData } from '../schemas/Tag'
import { TaskData } from '../schemas/Task'
import { EventData } from '../schemas/Event'
import { PostData } from '../schemas/Post'
import { FileData } from '../schemas/File'
import { EntryData } from '../schemas/Entry'

export type TagColor = 'gray' | 'red' | 'yellow' | 'green' | 'blue' | 'purple'
export type TagsObjectType = 'task' | 'event' | 'post' | 'work' | 'entry'
export type ObjectSchema = EntryData | FileData | PostData | EventData | TaskData

export interface CreateTagOptions {
  _projectId: string
  color?: TagColor
}

export interface UpdateTagOptions {
  name?: string
  color?: TagColor
}

export interface UpdateTagResponse {
  _id: string
  _projectId: string
  name: string
  _creatorId: string
  updated: string
  created: string
  isArchived: boolean
  color: TagColor
}

export interface RelateTagResponse {
  tagIds: string[]
}

export interface ArchiveTagResponse {
  isArchived: boolean
  updated: string
  _id: string
  _projectId: string
}

export interface UnarchiveTagResponse {
  isArchived: boolean
  updated: string
  _id: string
  _projectId: string
}

export class TagFetch extends BaseFetch {
  create(options: CreateTagOptions): Observable<TagData> {
    return this.fetch.post(`tags`, options)
  }

  get(_id: string, query?: any): Observable<TagData> {
    return this.fetch.get(`tags/${_id}`, query)
  }

  update(_id: string, option: UpdateTagOptions): Observable<UpdateTagResponse> {
    return this.fetch.put(`tags/${_id}`, option)
  }

  delete(_id: string): Observable<void> {
    return this.fetch.delete<void>(`tags/${_id}`)
  }

  archive(_id: string): Observable<ArchiveTagResponse> {
    return this.fetch.post(`tags/${_id}/archive`)
  }

  getByObject(_objectId: string, objectType: TagsObjectType, query?: any): Observable<TagData[]> {
    return this.fetch.get(`tags/${objectType}s/${_objectId}/tags`, query)
  }

  getByProjectId(_projectId: string, query?: any): Observable<TagData[]> {
    return this.fetch.get(`projects/${_projectId}/tags`, query)
  }

  getRelated<T extends ObjectSchema>(_tagId: string, objectType: TagsObjectType, query?: any): Observable<T[]> {
    return this.fetch.get(`tags/${_tagId}/${objectType}s`)
  }

  relateTag(_objectId: string, objectType: TagsObjectType, tagId: string): Observable<RelateTagResponse> {
    return this.fetch.put(`${objectType}s/${_objectId}/tags/${tagId}`)
  }

  unarchive(_id: string): Observable<UnarchiveTagResponse> {
    return this.fetch.delete(`tags/${_id}/archive`)
  }
}

export default new TagFetch()
