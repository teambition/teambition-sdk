'use strict'
import BaseFetch from './BaseFetch'
import FileSchema from '../schemas/File'

export interface FileRes {
  fileName: string
  fileSize: string
  fileType: string
  fileCategory: string
  fileKey: string
}

export interface FileCreateOptions extends FileRes {
  _parentId?: string
}

export class FileFetch extends BaseFetch {
  create(_parentId: string, fileRes: FileCreateOptions): Promise<FileSchema> {
    fileRes._parentId = _parentId
    return this.fetch.post(`works`, fileRes)
  }
}

export default new FileFetch()
