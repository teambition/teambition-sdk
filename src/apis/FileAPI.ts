'use strict'
import { Observable, Observer } from 'rxjs'
import FileSchema from '../schemas/File'
import WorkModel from '../models/WorkModel'
import StrikerFetch from '../fetchs/StrikerFetch'
import FileFetch from '../fetchs/FileFetch'
import { observableError } from './utils'

export class FileAPI {
  constructor () {
    WorkModel.destructor()
  }

  create(file: File, parentId: string): Observable<FileSchema> {
    return Observable.create((observer: Observer<FileSchema>) => {
      Observable.fromPromise(StrikerFetch.upload(file))
        .catch(err => observableError(observer, err))
        .concatMap(res => Observable.fromPromise<FileSchema>(FileFetch.create(parentId, <any>res)))
        .catch(err => observableError(observer, err))
        .concatMap(file => WorkModel.addOne(file))
        .forEach(r => observer.next(r))
        .then(x => observer.complete())
    })
  }
}
