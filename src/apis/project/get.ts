import { Observable } from 'rxjs/Observable'
import { QueryToken } from 'reactivedb'

import { SDK, CacheStrategy } from '../../SDK'
import { SDKFetch } from '../../SDKFetch'
import { ProjectId } from 'teambition-types'
import { ProjectSchema } from '../../schemas'
import { AssocField } from '../../Net'

export function getProjectFetch(
  this: SDKFetch,
  projectId: ProjectId
): Observable<ProjectSchema> {
  return this.get<ProjectSchema>(`projects/${projectId}`)
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
  assocFields?: AssocField<ProjectSchema>
): QueryToken<ProjectSchema> {
  return this.lift<ProjectSchema>({
    cacheValidate: CacheStrategy.Request,
    tableName: 'Project',
    request: this.fetch.getProject(projectId),
    query: { where: { _id: projectId } },
    assocFields: assocFields,
  })
}

declare module '../../SDK' {
  // tslint:disable-next-line:no-shadowed-variable
  interface SDK {
    getProject: typeof getProject
  }
}

SDK.prototype.getProject = getProject
