import { Observable } from 'rxjs/Observable'
import { QueryToken } from 'reactivedb'

import { SDK, CacheStrategy } from '../../SDK'
import { SDKFetch } from '../../SDKFetch'
import { ProjectId } from 'teambition-types'
import { ProjectSchema } from '../../schemas'

export function getProjectFetch(
  this: SDKFetch,
  projectId: ProjectId
): Observable<ProjectSchema> {
  return this.get<ProjectSchema>(`projects/${projectId}`)
}

declare module '../../SDKFetch' {
  // tslint:disable-next-line:no-shadowed-variable
  interface SDKFetch {
    getProjectFetch: typeof getProjectFetch
  }
}

SDKFetch.prototype.getProjectFetch = getProjectFetch

export function getProject(
  this: SDK,
  projectId: ProjectId
): QueryToken<ProjectSchema> {
  return this.lift<ProjectSchema>({
    cacheValidate: CacheStrategy.Request,
    tableName: 'Project',
    request: this.fetch.getProjectFetch(projectId),
    query: { where: { _id: projectId } },
  })
}

declare module '../../SDK' {
  // tslint:disable-next-line:no-shadowed-variable
  interface SDK {
    getProject: typeof getProject
  }
}

SDK.prototype.getProject = getProject
