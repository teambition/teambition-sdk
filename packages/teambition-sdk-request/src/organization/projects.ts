import { Observable } from 'rxjs/Observable'
import { SDKFetch, ProjectSchema } from 'teambition-sdk-core'
import { OrganizationId, TagId } from 'teambition-types'

import { UrlPagingQuery } from '../utils'

export function getAllOrganizationProjects(
  this: SDKFetch,
  orgId: OrganizationId,
  query?: UrlPagingQuery
): Observable<ProjectSchema> {
  return this.get<ProjectSchema>(`organizations/${orgId}/projects/all`, query)
}

export function getJoinedOrganizationProjects(
  this: SDKFetch,
  orgId: OrganizationId,
  query?: UrlPagingQuery
): Observable<ProjectSchema> {
  return this.get<ProjectSchema>(`organizations/${orgId}/projects/joined`, query)
}

export function getPublicOrganizationProjects(
  this: SDKFetch,
  orgId: OrganizationId,
  query?: UrlPagingQuery
): Observable<ProjectSchema> {
  return this.get<ProjectSchema>(`organizations/${orgId}/projects/public`, query)
}

export function getStarredOrganizationProjects(
  this: SDKFetch,
  orgId: OrganizationId
): Observable<ProjectSchema> {
  return this.get<ProjectSchema>(`organizations/${orgId}/projects/starred`)
}

export function getOrganizationProjectsByTagId(
  this: SDKFetch,
  orgId: OrganizationId,
  tagId: TagId,
  query?: UrlPagingQuery
): Observable<ProjectSchema> {
  return this.get<ProjectSchema>(`organizations/${orgId}/projecttags/${tagId}/projects`, query)
}

export function getUngroupedOrganizationProjects(
  this: SDKFetch,
  orgId: OrganizationId
): Observable<ProjectSchema> {
  return this.get<ProjectSchema>(`organizations/${orgId}/projects/ungrouped`)
}

SDKFetch.prototype.getAllOrganizationProjects = getAllOrganizationProjects
SDKFetch.prototype.getJoinedOrganizationProjects = getJoinedOrganizationProjects
SDKFetch.prototype.getPublicOrganizationProjects = getPublicOrganizationProjects
SDKFetch.prototype.getStarredOrganizationProjects = getStarredOrganizationProjects
SDKFetch.prototype.getOrganizationProjectsByTagId = getOrganizationProjectsByTagId
SDKFetch.prototype.getUngroupedOrganizationProjects = getUngroupedOrganizationProjects

declare module 'teambition-sdk-core/dist/cjs/SDKFetch' {
  // tslint:disable-next-line no-shadowed-variable
  interface SDKFetch {
    getAllOrganizationProjects: typeof getAllOrganizationProjects,
    getJoinedOrganizationProjects: typeof getJoinedOrganizationProjects,
    getPublicOrganizationProjects: typeof getPublicOrganizationProjects,
    getStarredOrganizationProjects: typeof getStarredOrganizationProjects,
    getOrganizationProjectsByTagId: typeof getOrganizationProjectsByTagId,
    getUngroupedOrganizationProjects: typeof getUngroupedOrganizationProjects
  }
}
