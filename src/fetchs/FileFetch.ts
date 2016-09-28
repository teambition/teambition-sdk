'use strict'
import BaseFetch from './BaseFetch'
import { FileData } from '../schemas/File'
import { FavoriteResponse, UndoFavoriteResponse } from '../teambition'

export interface FileRes {
  fileName: string
  fileSize: string
  fileType: string
  fileCategory: string
  fileKey: string
}

export interface FileCreateOptions {
  _parentId?: string
  works: FileRes[]
}

export interface UpdateFileOptions {
  fileName?: string
  description?: string
}

export interface UpdateFileResponse {
  _id: string
  fileName?: string
  description?: string
  updated: string
}

export interface ArchiveFileResponse {
  isArchived: boolean
  updated: string
  _id: string
  _projectId: string
}

export interface MoveFileResponse {
  _id: string
  _parentId: string
  _projectId: string
  tagIds: string[]
  involveMembers: string[]
  updated: string
}

export interface UpdateFileInvolvesResponse {
  _id: string
  involveMembers: string[]
  updated: string
}

export class FileFetch extends BaseFetch {
  create(_parentId: string, fileRes: FileRes | FileRes []): Promise<FileData[]> {
    const postBody = {
      _parentId: _parentId,
      works: fileRes instanceof Array ? fileRes : [ fileRes ]
    }
    return this.fetch.post(`works`, postBody)
  }

  get(FileId: string, query?: any): Promise<FileData> {
    return this.fetch.get(`works/${FileId}`, query)
  }

  update(FileId: string, options: UpdateFileOptions): Promise<UpdateFileResponse> {
    return this.fetch.put(`works/${FileId}`, options)
  }

  delete(FileId: string): Promise<void> {
    return this.fetch.delete<void>(`works/${FileId}`)
  }

  archive(FileId: string): Promise<ArchiveFileResponse> {
    return this.fetch.post(`works/${FileId}/archive`)
  }

  unarchive(FileId: string): Promise<ArchiveFileResponse> {
    return this.fetch.delete(`works/${FileId}/archive`)
  }

  favorite(FileId: string): Promise<FavoriteResponse> {
    return this.fetch.post(`works/${FileId}/favorite`)
  }

  undoFavourite(FileId: string): Promise<UndoFavoriteResponse> {
    return this.fetch.delete(`works/${FileId}/favorite`)
  }

  fork(FileId: string, _parentId: string): Promise<FileData> {
    return this.fetch.put(`works/${FileId}/fork`, {
      _parentId
    })
  }

  getFiles(projectId: string, parentId: string, query?: any): Promise<FileData[]> {
    return this.fetch.get(`projects/${projectId}/collections/${parentId}/works`, query)
  }

  move(FileId: string, _parentId: string): Promise<MoveFileResponse> {
    return this.fetch.put(`works/${FileId}/move`, {_parentId})
  }

  updateInvolves(FileId: string, memberIds: string[], type: 'involveMembers' | 'addInvolvers' | 'delInvolvers'): Promise<UpdateFileInvolvesResponse> {
    const putData = Object.create(null)
    putData[type] = memberIds
    return this.fetch.put(`works/${FileId}/involveMembers`, putData)
  }
}

export default new FileFetch()
