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
import { FavoriteResponse, UndoFavoriteResponse } from '../teambition'
import { makeColdSignal } from './utils'

export class FileAPI {

  create(file: File, parentId: string): Observable<FileData> {
    return StrikerFetch.upload(file)
      .concatMap(res => FileFetch.create(parentId, <any>res))
      .concatMap(files => FileModel.addOne(files[0]).take(1))
  }

  get(fileId: string, query?: any): Observable<FileData> {
    return makeColdSignal<FileData>(() => {
      const cache = FileModel.getOne(fileId)
      if (cache && FileModel.checkSchema(fileId)) {
        return cache
      }
      return FileFetch.get(fileId, query)
        .concatMap(file => FileModel.addOne(file))
    })
  }

  update(fileId: string, patch: UpdateFileOptions): Observable<UpdateFileResponse> {
    return FileFetch.update(fileId, patch)
      .concatMap(data => FileModel.update(fileId, data))
  }

  delete(fileId: string): Observable<void> {
    return FileFetch.delete(fileId)
      .concatMap(() => FileModel.delete(fileId))
  }

  archive(fileId: string): Observable<ArchiveFileResponse> {
    return FileFetch.archive(fileId)
      .concatMap(data => FileModel.update(fileId, data))
  }

  unarchive(fileId: string): Observable<ArchiveFileResponse> {
    return FileFetch.unarchive(fileId)
      .concatMap(data => FileModel.update(fileId, data))
  }

  favorite(fileId: string): Observable<FavoriteResponse> {
    return FileFetch.favorite(fileId)
      .concatMap(data => {
        return FileModel.update(fileId, {
            isFavorite: data.isFavorite
          })
          .map(() => data)
      })
  }

  /**
   * @see http://english.stackexchange.com/questions/231617/is-unfavorite-a-legit-english-verb
   */
  undoFavorite(fileId: string): Observable<UndoFavoriteResponse> {
    return FileFetch.undoFavourite(fileId)
      .concatMap(data => {
        return FileModel.update(fileId, {
            isFavorite: data.isFavorite
          })
          .map(() => data)
      })
  }

  fork(fileId: string, _parentId: string): Observable<FileData> {
    return FileFetch.fork(fileId, _parentId)
      .concatMap(file => FileModel.addOne(file).take(1))
  }

  move(fileId: string, _parentId: string): Observable<MoveFileResponse> {
    return FileFetch.move(fileId, _parentId)
      .concatMap(data => FileModel.update(fileId, data))
  }

  updateInvolves(
    fileId: string,
    memberIds: string[],
    type: 'involveMembers' | 'addInvolvers' | 'delInvolvers'
  ): Observable<UpdateFileInvolvesResponse> {
    return FileFetch.updateInvolves( fileId, memberIds, type )
      .concatMap(data => FileModel.update(fileId, data))
  }

  getFiles(
    projectId: string,
    parentId: string,
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
