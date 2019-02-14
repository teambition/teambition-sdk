import { Observable } from 'rxjs/Observable'

import { QueryToken } from '../../db'
import { SDK } from '../../SDK'
import { SDKFetch } from '../../SDKFetch'
import { ProjectId, OrganizationId, TagType } from 'teambition-types'
import { TagSchema } from '../../schemas'
import { CacheStrategy } from '../../Net'

export function getTagsFetch(
  this: SDKFetch,
  boundToObjectId: ProjectId,
  tagType?: 'project',
): Observable<TagSchema[]>

export function getTagsFetch(
  this: SDKFetch,
  boundToObjectId: OrganizationId,
  tagType: 'organization',
): Observable<TagSchema[]>

export function getTagsFetch(
  this: SDKFetch,
  boundToObjectId: ProjectId | OrganizationId,
  tagType: TagType
): Observable<TagSchema[]>

export function getTagsFetch(
  this: SDKFetch,
  boundToObjectId: ProjectId | OrganizationId,
  tagType: TagType = 'project',
): Observable<TagSchema[]> {
  const query = tagType === 'organization'
    ? { _organizationId: boundToObjectId }
    : { _projectId: boundToObjectId }

  return this.get<TagSchema[]>('tags', { tagType, ...query })
}

declare module '../../SDKFetch' {
  interface SDKFetch {
    getTags: typeof getTagsFetch
  }
}

SDKFetch.prototype.getTags = getTagsFetch

export function getTags(
  this: SDK,
  boundToObjectId: ProjectId,
  tagType?: 'project',
): QueryToken<TagSchema>

export function getTags(
  this: SDK,
  boundToObjectId: OrganizationId,
  tagType: 'organization',
): QueryToken<TagSchema>

export function getTags(
  this: SDK,
  boundToObjectId: ProjectId | OrganizationId,
  tagType: TagType
): QueryToken<TagSchema>

export function getTags(
  this: SDK,
  boundToObjectId: ProjectId | OrganizationId,
  tagType: TagType = 'project',
): QueryToken<TagSchema> {
  const query = tagType === 'organization'
    ? { _organizationId: boundToObjectId }
    : { _projectId: boundToObjectId }

  return this.lift<TagSchema>({
    cacheValidate: CacheStrategy.Request,
    tableName: 'Tag',
    request: this.fetch.getTags(boundToObjectId, tagType),
    query: { where: [query] }
  })
}

declare module '../../SDK' {
  interface SDK {
    getTags: typeof getTags
  }
}

SDK.prototype.getTags = getTags
