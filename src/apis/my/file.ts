import { Observable } from '../../rx'
import { SDKFetch } from '../../SDKFetch'
import { FileSchema } from '../../schemas/File'

export interface GetMyFilesQuery {
  page: number
  limit: number
  order: 'updatedAsc' | 'updatedDesc' | 'sizeAsc' | 'sizeDesc' | 'nameAsc' | 'nameDesc'
}

export function getMyCreateFilesFetch(this: SDKFetch, opt: GetMyFilesQuery): Observable<FileSchema[]> {
  return this.get('works/me/create', opt)
}

export function getMyInvolveFilesFetch(this: SDKFetch, opt?: GetMyFilesQuery): Observable<FileSchema[]> {
  return this.get('works/me/involve', opt)
}

SDKFetch.prototype.getMyCreateFiles = getMyCreateFilesFetch
SDKFetch.prototype.getMyInvolveFiles = getMyInvolveFilesFetch

declare module '../../SDKFetch' {
  interface SDKFetch { // tslint:disable-line:no-shadowed-variable
    getMyCreateFiles: typeof getMyCreateFilesFetch
    getMyInvolveFiles: typeof getMyInvolveFilesFetch
  }
}
