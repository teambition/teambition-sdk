'use strict'
import { Observable } from 'rxjs/Observable'
import { FileData } from '../schemas/File'
import FileModel from '../models/FileModel'
import StrikerFetch from '../fetchs/StrikerFetch'
import FileFetch, {
  UpdateFileOptions,
  UpdateFileResponse,
  ArchiveFileResponse,
  MoveFileResponse,
  UpdateFileInvolvesResponse
} from '../fetchs/FileFetch'
import {
  CollectionId,
  FileId,
  ProjectId,
  UserId
} from '../teambition'
import { makeColdSignal } from './utils'

export class FileAPI {

  create(file: File, parentId: CollectionId): Observable<FileData> {
    return StrikerFetch.upload(file)
      .concatMap(res =>
        FileFetch.create(parentId, res)
      )
      .concatMap(files =>
        FileModel.addOne(files[0])
          .take(1)
      )
  }

  get(fileId: FileId, query?: any): Observable<FileData> {
    return makeColdSignal<FileData>(() => {
      const cache = FileModel.getOne(fileId)
      if (cache && FileModel.checkSchema(<string>fileId)) {
        return cache
      }
      return FileFetch.get(fileId, query)
        .concatMap(file =>
          FileModel.addOne(file)
        )
    })
  }

  update(fileId: FileId, patch: UpdateFileOptions): Observable<UpdateFileResponse> {
    return FileFetch.update(fileId, patch)
      .concatMap(data =>
        FileModel.update(<string>fileId, data)
      )
  }

  delete(fileId: FileId): Observable<void> {
    return FileFetch.delete(fileId)
      .concatMap(() =>
        FileModel.delete(<string>fileId)
      )
  }

  archive(fileId: FileId): Observable<ArchiveFileResponse> {
    return FileFetch.archive(fileId)
      .concatMap(data =>
        FileModel.update(<string>fileId, data)
      )
  }

  unarchive(fileId: FileId): Observable<ArchiveFileResponse> {
    return FileFetch.unarchive(fileId)
      .concatMap(data =>
        FileModel.update(<string>fileId, data)
      )
  }

  fork(fileId: FileId, _parentId: CollectionId): Observable<FileData> {
    return FileFetch.fork(fileId, _parentId)
      .concatMap(file =>
        FileModel.addOne(file)
          .take(1)
      )
  }

  move(fileId: FileId, _parentId: CollectionId): Observable<MoveFileResponse> {
    return FileFetch.move(fileId, _parentId)
      .concatMap(data =>
        FileModel.update(<string>fileId, data)
      )
  }

  updateInvolves(
    fileId: FileId,
    memberIds: UserId[],
    type: 'involveMembers' | 'addInvolvers' | 'delInvolvers'
  ): Observable<UpdateFileInvolvesResponse> {
    return FileFetch.updateInvolves( fileId, memberIds, type )
      .concatMap(data =>
        FileModel.update(<string>fileId, data)
      )
  }

  getFiles(
    projectId: ProjectId,
    parentId: CollectionId,
    query?: any
  ): Observable<FileData[]> {
    return makeColdSignal<FileData[]>(() => {
      const page = query ? query.page : 1
      const cache = FileModel.getFiles(projectId, parentId, page)
      if (cache) {
        return cache
      }
      return FileFetch.getFiles( projectId, parentId, query)
        .concatMap(files => {
          return FileModel.addFiles( projectId, parentId, files, page)
        })
    })
  }
}

export default new FileAPI
