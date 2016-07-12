'use strict'
import { Observable } from 'rxjs/Observable'
import BaseModel from './BaseModel'
import { FileData, default as FileSchema } from '../schemas/File'
import { dataToSchema } from '../utils/index'

export class WorkModel extends BaseModel {
  addOne(file: FileData): Observable<FileData> {
    const result = dataToSchema<FileData>(file, FileSchema)
    return this._save(result)
  }
}

export default new WorkModel()
