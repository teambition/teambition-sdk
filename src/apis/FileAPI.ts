'use strict'
import { Observable } from 'rxjs'
import FileSchema from '../schemas/File'
import WorkModel from '../models/WorkModel'
import StrikerFetch from '../fetchs/StrikerFetch'
import FileFetch from '../fetchs/FileFetch'
import { makeColdSignal, errorHandler } from './utils'

export class FileAPI {
  constructor () {
    WorkModel.destructor()
  }

  create(file: File, parentId: string): Observable<FileSchema> {
    return makeColdSignal(observer => {
      return Observable.fromPromise(StrikerFetch.upload(file))
        .catch(err => errorHandler(observer, err))
        .concatMap(res => Observable.fromPromise(FileFetch.create(parentId, res)))
        .catch(err => errorHandler(observer, err))
        .concatMap(file => WorkModel.add(file))
    })
  }
}
