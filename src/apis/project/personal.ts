import { Observable } from 'rxjs'
import { SDKFetch } from '../../SDKFetch'
import { ProjectSchema } from '../../schemas/Project'
import { UrlPagingQuery } from '../../utils/internalTypes'

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

declare module '../../SDKFetch' {
  interface SDKFetch {
    getPersonalProjects: typeof getPersonalProjects
  }
}
