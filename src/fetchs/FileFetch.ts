'use strict'
import BaseFetch from './BaseFetch'
import { FileData } from '../schemas/File'
import { FavoriteResponse, LikeResponse } from '../teambition'
import { assign } from '../utils'

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
  fileName: string
  description?: string
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

  update(FileId: string, options: UpdateFileOptions): Promise<FileData> {
    return this.fetch.put(`works/${FileId}`, options)
  }

  delete(FileId: string): Promise<void> {
    return this.fetch.delete(`works/${FileId}`)
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

  fork(FileId: string, _parentId: string): Promise<FileData> {
    return this.fetch.put(`works/${FileId}/fork`, {
      _parentId
    })
  }

  getCollectionFiles(projectId: string, parentId: string, page = 1, count = 30, query?: any): Promise<FileData[]> {
    const _query = {
      page,
      count
    }
    if (query && typeof query === 'object') {
      assign(_query, query)
    }
    return this.fetch.get(`projects/${projectId}/collections/${parentId}/works`, _query)
  }

  like(FileId: string): Promise<LikeResponse> {
    return this.fetch.post(`works/${FileId}/like`)
  }

  move(FileId: string): Promise<MoveFileResponse> {
    return this.fetch.put(`works/${FileId}/move`)
  }

  updateInvolves(FileId: string, memberIds: string[], type: 'involveMembers' | 'addInvolvers' | 'delInvolvers'): Promise<UpdateFileInvolvesResponse> {
    const putData = Object.create(null)
    putData[type] = memberIds
    return this.fetch.put(`works/${FileId}/involveMembers`, putData)
  }
}

export default new FileFetch()
