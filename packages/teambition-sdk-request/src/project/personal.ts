import { Observable } from 'rxjs/Observable'
import { ProjectSchema, SDKFetch } from 'teambition-sdk-core'

import { UrlPagingQuery } from '../utils'

export type GetPersonalProjectsQueryParams = {
  isArchived: boolean,
  isStar: boolean,
  [key: string]: any
}

export interface GetPersonalProjectsUrlQuery
  extends Partial<GetPersonalProjectsQueryParams>, UrlPagingQuery {}

export function getPersonalProjects(
  this: SDKFetch,
  query: GetPersonalProjectsUrlQuery
): Observable<ProjectSchema[]> {
  return this.get<ProjectSchema[]>('projects/personal', query)
}

SDKFetch.prototype.getPersonalProjects = getPersonalProjects

declare module 'teambition-sdk-core/dist/cjs/SDKFetch' {
  // tslint:disable-next-line no-shadowed-variable
  interface SDKFetch {
    getPersonalProjects: typeof getPersonalProjects
  }
}
