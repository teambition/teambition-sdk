import { Observable } from 'rxjs/Observable'
import { QueryToken } from 'reactivedb'

import { SDK } from '../../SDK'
import { SDKFetch } from '../../SDKFetch'
import { ProjectId } from 'teambition-types'
import { TagSchema } from '../../schemas'
import { CacheStrategy } from '../../Net'

export function getTagsFetch(
  this: SDKFetch,
  projectId: ProjectId
): Observable<TagSchema[]> {
  return this.get<TagSchema[]>('tags', { _projectId: projectId })
}

declare module '../../SDKFetch' {
  interface SDKFetch {
    getTags: typeof getTagsFetch
  }
}

SDKFetch.prototype.getTags = getTagsFetch

export function getTags(
  this: SDK,
  projectId: ProjectId
): QueryToken<TagSchema> {
  return this.lift<TagSchema>({
    cacheValidate: CacheStrategy.Request,
    tableName: 'Tag',
    request: this.fetch.getTags(projectId),
    query: { where: [{ _projectId: projectId }] }
  })
}

declare module '../../SDK' {
  interface SDK {
    getTags: typeof getTags
  }
}

SDK.prototype.getTags = getTags
