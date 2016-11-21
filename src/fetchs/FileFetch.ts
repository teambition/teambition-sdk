'use strict'
import { Observable } from 'rxjs/Observable'
import BaseFetch from './BaseFetch'
import { FileData } from '../schemas/File'
import {
  FavoriteResponse,
  UndoFavoriteResponse,
  FileId,
  CollectionId,
  ProjectId,
  TagId,
  UserId
} from '../teambition'

export interface FileRes {
  fileName: string
  fileSize: string
  fileType: string
  fileCategory: string
  fileKey: string
}

export interface FileCreateOptions {
  _parentId?: CollectionId
  works: FileRes[]
}

export interface UpdateFileOptions {
  fileName?: string
  description?: string
}

export interface UpdateFileResponse {
  _id: FileId
  fileName?: string
  description?: string
  updated: string
}

export interface ArchiveFileResponse {
  isArchived: boolean
  updated: string
  _id: FileId
  _projectId: ProjectId
}

export interface MoveFileResponse {
  _id: string
  _parentId: CollectionId
  _projectId: ProjectId
  tagIds: TagId[]
  involveMembers: UserId[]
  updated: string
}

export interface UpdateFileInvolvesResponse {
  _id: FileId
  involveMembers: UserId[]
  updated: string
}

export class FileFetch extends BaseFetch {
  create(_parentId: CollectionId, fileRes: FileRes | FileRes []): Observable<FileData[]> {
    const postBody = {
      _parentId: _parentId,
      works: fileRes instanceof Array ? fileRes : [ fileRes ]
    }
    return this.fetch.post(`works`, postBody)
  }

  get(FileId: FileId, query?: any): Observable<FileData> {
    return this.fetch.get(`works/${FileId}`, query)
  }

  getByTagId(tagId: TagId, query?: any): Observable<FileData[]> {
    return this.fetch.get(`tags/${tagId}/works`, query)
  }

  update(FileId: FileId, options: UpdateFileOptions): Observable<UpdateFileResponse> {
    return this.fetch.put(`works/${FileId}`, options)
  }

  delete(FileId: FileId): Observable<void> {
    return this.fetch.delete<void>(`works/${FileId}`)
  }

  archive(FileId: FileId): Observable<ArchiveFileResponse> {
    return this.fetch.post(`works/${FileId}/archive`)
  }

  unarchive(FileId: FileId): Observable<ArchiveFileResponse> {
    return this.fetch.delete(`works/${FileId}/archive`)
  }

  favorite(FileId: FileId): Observable<FavoriteResponse> {
    return this.fetch.post(`works/${FileId}/favorite`)
  }

  undoFavourite(FileId: FileId): Observable<UndoFavoriteResponse> {
    return this.fetch.delete(`works/${FileId}/favorite`)
  }

  fork(FileId: FileId, _parentId: CollectionId): Observable<FileData> {
    return this.fetch.put(`works/${FileId}/fork`, {
      _parentId
    })
  }

  getFiles(projectId: ProjectId, parentId: CollectionId, query?: any): Observable<FileData[]> {
    return this.fetch.get(`projects/${projectId}/collections/${parentId}/works`, query)
  }

  move(FileId: FileId, _parentId: CollectionId): Observable<MoveFileResponse> {
    return this.fetch.put(`works/${FileId}/move`, {_parentId})
  }

  updateInvolves(
    FileId: FileId,
    memberIds: UserId[],
    type: 'involveMembers' | 'addInvolvers' | 'delInvolvers'
  ): Observable<UpdateFileInvolvesResponse> {
    const putData = Object.create(null)
    putData[type] = memberIds
    return this.fetch.put(`works/${FileId}/involveMembers`, putData)
  }
}

export default new FileFetch
