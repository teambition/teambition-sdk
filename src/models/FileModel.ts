'use strict'
import { Observable } from 'rxjs/Observable'
import BaseModel from './BaseModel'
import { FileData, default as File } from '../schemas/File'
import { dataToSchema, datasToSchemas } from '../utils/index'
import Collection from './BaseCollection'

export class FileModel extends BaseModel {
  private _schemaName = 'File'

  addOne(file: FileData): Observable<FileData> {
    const result = dataToSchema<FileData>(file, File)
    return this._save(result)
  }

  getOne(fileId: string): Observable<FileData> {
    return this._get<FileData>(fileId)
  }

  addFiles(
    projectId: string,
    parentId: string,
    files: FileData[],
    page: number
  ): Observable<FileData[]> {
    const dbIndex = `project:folder:files/${projectId}/${parentId}`
    const result = datasToSchemas<FileData>(files, File)
    let collection = this._collections.get(dbIndex)
    if (!collection) {
      collection = new Collection(
        this._schemaName,
        (data: FileData) => {
          return data._projectId === projectId &&
              data._parentId === parentId &&
              !data.isArchived
        },
        dbIndex
      )
      this._collections.set(dbIndex, collection)
    }
    return collection.addPage(page, result)
  }

  getFiles(
    projectId: string,
    parentId: string,
    page: number
  ): Observable<FileData[]> {
    const dbIndex = `project:folder:files/${projectId}/${parentId}`
    const collection = this._collections.get(dbIndex)
    if (collection) {
      return collection.get(page)
    }
    return null
  }
}

export default new FileModel()
