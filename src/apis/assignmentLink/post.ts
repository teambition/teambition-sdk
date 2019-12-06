import { Observable } from 'rxjs/Observable'
import { ProjectId } from 'teambition-types'
import { SDKFetch } from '../../SDKFetch'
import { SDK } from '../../SDK'
import { AssignmentLinkSchema } from '../../schemas/AssignmentLink'

type AssignmentLink = Pick<
  AssignmentLinkSchema,
  'name' | '_projectId' | '_assignedProjectId'
  | '_executorId' | 'assignmentType'
>

export function createAssignmentLinkFetch(
  this: SDKFetch,
  projectId: ProjectId,
  assignmentLink: AssignmentLink
): Observable<AssignmentLinkSchema> {
  return this.post(`projects/${projectId}/assignment-links`, assignmentLink)
}

SDKFetch.prototype.createAssignmentLink = createAssignmentLinkFetch

declare module '../../SDKFetch' {
  // tslint:disable-next-line: no-shadowed-variable
  interface SDKFetch {
    createAssignmentLink: typeof createAssignmentLinkFetch
  }
}

export function createAssignmentLink(
  this: SDK, projectId: ProjectId, assignmentLink: AssignmentLink
): Observable<AssignmentLinkSchema> {
  return this.lift({
    request: this.fetch.createAssignmentLink(projectId, assignmentLink),
    tableName: 'AssignmentLink',
    method: 'create'
  })
}

SDK.prototype.createAssignmentLink = createAssignmentLink

declare module '../../SDK' {
  export interface SDK {
    createAssignmentLink: typeof createAssignmentLink
  }
}
