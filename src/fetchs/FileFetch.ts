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

export interface FileCreateOptions {
  _parentId?: string
  works: FileRes[]
}

export class FileFetch extends BaseFetch {
  create(_parentId: string, fileRes: FileRes | FileRes []): Promise<FileSchema[]> {
    const postBody = {
      _parentId: _parentId,
      works: fileRes instanceof Array ? fileRes : [ fileRes ]
    }
    return this.fetch.post(`works`, postBody)
  }
}

export default new FileFetch()
