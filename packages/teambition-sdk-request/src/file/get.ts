import { Observable } from 'rxjs/Observable'
import { QueryToken } from 'reactivedb'
import { CacheStrategy, SDK, SDKFetch, FileSchema } from 'teambition-sdk-core'
import { FileId } from 'teambition-types'

export function getFileFetch(
  this: SDKFetch,
  fileId: FileId,
  query?: any
): Observable<FileSchema> {
  return this.get<FileSchema>(`works/${fileId}`, query)
}

SDKFetch.prototype.getFile = getFileFetch

declare module 'teambition-sdk-core/dist/cjs/SDKFetch' {
  // tslint:disable-next-line no-shadowed-variable
  interface SDKFetch {
    getFile: typeof getFileFetch
  }
}

export function getFile (
  this: SDK,
  fileId: FileId,
  query?: any
): QueryToken<FileSchema> {
  query = query || { }
  return this.lift<FileSchema>({
    request: this.fetch.getFile(fileId, query),
    tableName: 'File',
    cacheValidate: CacheStrategy.Cache,
    query: {
      where: { _id: fileId }
    },
    assocFields: {
      creator: ['_id', 'name', 'avatarUrl']
    },
    excludeFields: ['class']
  })
}

SDK.prototype.getFile = getFile

declare module 'teambition-sdk-core/dist/cjs/SDK' {
  // tslint:disable-next-line no-shadowed-variable
  interface SDK {
    getFile: typeof getFile
  }
}
