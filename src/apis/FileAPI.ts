'use strict'
import { Observable } from 'rxjs/Observable'
import { Observer } from 'rxjs/Observer'
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
import { makeColdSignal, observableError, errorHandler } from './utils'

export class FileAPI {

  create(file: File, parentId: string): Observable<FileData> {
    return Observable.create((observer: Observer<FileData>) => {
      Observable.fromPromise(StrikerFetch.upload(file))
        .catch(err => observableError(observer, err))
        .concatMap(res => Observable.fromPromise<FileData[]>(FileFetch.create(parentId, <any>res)))
        .catch(err => observableError(observer, err))
        .concatMap(files => FileModel.addOne(files[0]).take(1))
        .forEach(r => observer.next(r))
        .then(() => observer.complete())
    })
  }

  get(fileId: string, query?: any): Observable<FileData> {
    return makeColdSignal<FileData>(observer => {
      const cache = FileModel.getOne(fileId)
      if (cache && FileModel.checkSchema(fileId)) {
        return cache
      }
      return Observable.fromPromise(FileFetch.get(fileId, query))
        .catch(error => errorHandler(observer, error))
        .concatMap(file => FileModel.addOne(file))
    })
  }

  update(fileId: string, patch: UpdateFileOptions): Observable<UpdateFileResponse> {
    return Observable.create((observer: Observer<UpdateFileResponse>) => {
      Observable.fromPromise(FileFetch.update(fileId, patch))
        .catch(error => observableError(observer, error))
        .concatMap(data => FileModel.update(fileId, data))
        .forEach(data => observer.next(data))
        .then(() => observer.complete())
    })
  }

  delete(fileId: string): Observable<void> {
    return Observable.create((observer: Observer<void>) => {
      Observable.fromPromise(FileFetch.delete(fileId))
        .catch(error => observableError(observer, error))
        .concatMap(() => FileModel.delete(fileId))
        .forEach(() => observer.next(null))
        .then(() => observer.complete())
    })
  }

  archive(fileId: string): Observable<ArchiveFileResponse> {
    return Observable.create((observer: Observer<ArchiveFileResponse>) => {
      Observable.fromPromise(FileFetch.archive(fileId))
        .catch(error => observableError(observer, error))
        .concatMap(data => FileModel.update(fileId, data))
        .forEach(data => observer.next(data))
        .then(() => observer.complete())
    })
  }

  unarchive(fileId: string): Observable<ArchiveFileResponse> {
    return Observable.create((observer: Observer<ArchiveFileResponse>) => {
      Observable.fromPromise(FileFetch.unarchive(fileId))
        .catch(error => observableError(observer, error))
        .concatMap(data => FileModel.update(fileId, data))
        .forEach(data => observer.next(data))
        .then(() => observer.complete())
    })
  }

  favorite(fileId: string): Observable<FavoriteResponse> {
    return Observable.create((observer: Observer<FavoriteResponse>) => {
      Observable.fromPromise(FileFetch.favorite(fileId))
        .catch(error => observableError(observer, error))
        .concatMap(data => {
          return FileModel.update(fileId, {
              isFavorite: data.isFavorite
            })
            .map(() => data)
        })
        .forEach(data => observer.next(data))
        .then(() => observer.complete())
    })
  }

  /**
   * @see http://english.stackexchange.com/questions/231617/is-unfavorite-a-legit-english-verb
   */
  undoFavorite(fileId: string): Observable<UndoFavoriteResponse> {
    return Observable.create((observer: Observer<UndoFavoriteResponse>) => {
      Observable.fromPromise(FileFetch.undoFavourite(fileId))
        .catch(error => observableError(observer, error))
        .concatMap(data => {
          return FileModel.update(fileId, {
              isFavorite: data.isFavorite
            })
            .map(() => data)
        })
        .forEach(data => observer.next(data))
        .then(() => observer.complete())
    })
  }

  fork(fileId: string, _parentId: string): Observable<FileData> {
    return Observable.create((observer: Observer<FileData>) => {
      Observable.fromPromise(FileFetch.fork(fileId, _parentId))
        .catch(error => observableError(observer, error))
        .concatMap(file => FileModel.addOne(file).take(1))
        .forEach(file => observer.next(file))
        .then(() => observer.complete())
    })
  }

  move(fileId: string, _parentId: string): Observable<MoveFileResponse> {
    return Observable.create((observer: Observer<MoveFileResponse>) => {
      Observable.fromPromise(FileFetch.move(fileId, _parentId))
        .catch(error => observableError(observer, error))
        .concatMap(data => FileModel.update(fileId, data))
        .forEach(data => observer.next(data))
        .then(() => observer.complete())
    })
  }

  updateInvolves(
    fileId: string,
    memberIds: string[],
    type: 'involveMembers' | 'addInvolvers' | 'delInvolvers'
  ): Observable<UpdateFileInvolvesResponse> {
    return Observable.create((observer: Observer<UpdateFileInvolvesResponse>) => {
      Observable.fromPromise(FileFetch.updateInvolves(
          fileId,
          memberIds,
          type
        ))
        .catch(error => observableError(observer, error))
        .concatMap(data => FileModel.update(fileId, data))
        .forEach(data => observer.next(data))
        .then(() => observer.complete())
    })
  }

  getFiles(
    projectId: string,
    parentId: string,
    query?: any
  ): Observable<FileData[]> {
    return makeColdSignal<FileData[]>(observer => {
      const page = query ? query.page : 1
      const cache = FileModel.getFiles(projectId, parentId, page)
      if (cache) {
        return cache
      }
      return Observable.fromPromise(FileFetch.getFiles(
          projectId,
          parentId,
          query
        ))
        .catch(error => errorHandler(observer, error))
        .concatMap(files => {
          return FileModel.addFiles(
            projectId,
            parentId,
            files,
            page
          )
        })
    })
  }
}
