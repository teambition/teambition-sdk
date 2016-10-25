'use strict'
import { Observable } from 'rxjs/Observable'
import BaseModel from './BaseModel'
import { FileData, default as File } from '../schemas/File'
import { dataToSchema, datasToSchemas } from '../utils/index'
import Collection from './BaseCollection'
import {
  FileId,
  ProjectId,
  TagId,
  CollectionId
} from '../teambition'

export class FileModel extends BaseModel {
  private _schemaName = 'File'

  addOne(file: FileData): Observable<FileData> {
    const result = dataToSchema<FileData>(file, File)
    return this._save(result)
  }

  getOne(fileId: FileId): Observable<FileData> {
    return this._get<FileData>(<any>fileId)
  }

  addFiles(
    projectId: ProjectId,
    parentId: CollectionId,
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
    projectId: ProjectId,
    parentId: CollectionId,
    page: number
  ): Observable<FileData[]> {
    const dbIndex = `project:folder:files/${projectId}/${parentId}`
    const collection = this._collections.get(dbIndex)
    if (collection) {
      return collection.get(page)
    }
    return null
  }

  addByTagId(tagId: TagId, files: FileData[], page: number): Observable<FileData[]> {
    const dbIndex = `tag:files/${tagId}`
    const result = datasToSchemas(files, File)
    let collection = this._collections.get(dbIndex)

    if (!collection) {
      collection = new Collection(this._schemaName, (data: FileData) => {
        return !data.isArchived && data.tagIds && data.tagIds.indexOf(tagId) !== -1
      }, dbIndex)
      this._collections.set(dbIndex, collection)
    }
    return collection.addPage(page, result)
  }

  getByTagId(tagId: TagId, page: number): Observable<FileData[]> {
    const dbIndex = `tag:files/${tagId}`
    let collection = this._collections.get(dbIndex)
    if (collection) {
      return collection.get(page)
    }
    return null
  }
}

export default new FileModel
