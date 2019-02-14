import { Observable } from 'rxjs/Observable'

import { QueryToken } from '../../db'
import { SDK, CacheStrategy } from '../../SDK'
import { SDKFetch } from '../../SDKFetch'
import { ProjectId } from 'teambition-types'
import { ProjectSchema } from '../../schemas'
import { AssocField } from '../../Net'

export function getProjectFetch(
  this: SDKFetch,
  projectId: ProjectId,
  options?: {
    withOwner?: boolean
  }
): Observable<ProjectSchema> {
  return this.get<ProjectSchema>(`projects/${projectId}`, options)
}

declare module '../../SDKFetch' {
  // tslint:disable-next-line:no-shadowed-variable
  interface SDKFetch {
    getProject: typeof getProjectFetch
  }
}

SDKFetch.prototype.getProject = getProjectFetch

export function getProject(
  this: SDK,
  projectId: ProjectId,
  options?: {
    assocFields?: AssocField<ProjectSchema>
    withOwner?: boolean
  }
): QueryToken<ProjectSchema> {
  return this.lift<ProjectSchema>({
    cacheValidate: CacheStrategy.Request,
    tableName: 'Project',
    request: this.fetch.getProject(projectId, options),
    query: { where: { _id: projectId } },
    assocFields: {
      ...(options && options.assocFields),
      ...(options && options.withOwner ? { owner: ['_id', 'name', 'avatarUrl'] } : {})
    }
  })
}

declare module '../../SDK' {
  // tslint:disable-next-line:no-shadowed-variable
  interface SDK {
    getProject: typeof getProject
  }
}

SDK.prototype.getProject = getProject
