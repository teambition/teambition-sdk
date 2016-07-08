'use strict'
import { Observable } from 'rxjs/Observable'
import { Observer } from 'rxjs/Observer'
import { FileData } from '../schemas/File'
import WorkModel from '../models/WorkModel'
import StrikerFetch from '../fetchs/StrikerFetch'
import FileFetch from '../fetchs/FileFetch'
import { observableError } from './utils'

export class FileAPI {
  constructor () {
    WorkModel.destructor()
  }

  create(file: File, parentId: string): Observable<FileData> {
    return Observable.create((observer: Observer<FileData>) => {
      Observable.fromPromise(StrikerFetch.upload(file))
        .catch(err => observableError(observer, err))
        .concatMap(res => Observable.fromPromise<FileData[]>(FileFetch.create(parentId, <any>res)))
        .catch(err => observableError(observer, err))
        .concatMap(file => WorkModel.addOne(file[0]))
        .forEach(r => {
          observer.next(r)
          observer.complete()
        })
    })
  }
}
