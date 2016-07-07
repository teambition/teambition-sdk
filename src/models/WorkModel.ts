'use strict'
import { Observable } from 'rxjs/Observable'
import BaseModel from './BaseModel'
import FileSchema from '../schemas/File'
import { dataToSchema } from '../utils/index'

export class WorkModel extends BaseModel {
  addOne(file: FileSchema): Observable<FileSchema> {
    const result = dataToSchema<FileSchema>(file, FileSchema)
    return this._save(result)
  }
}

export default new WorkModel()
