import { Observable } from 'rxjs/Observable'
import { SDKFetch } from '../../SDKFetch'
import { ProjectId } from 'teambition-types'
import { AssignmentLinkSchema } from '../../schemas/AssignmentLink'

type AssignmentLink = Pick<
  AssignmentLinkSchema,
  'name' | '_projectId' | '_assignedProjectId'
  | '_executorId' | 'assignmentType' | '_creatorId'
>

export function createAssignmentLinksFetch(
  this: SDKFetch,
  projectId: ProjectId,
  assignmentLink: AssignmentLink
): Observable<AssignmentLinkSchema> {
  return this.post(`projects/${projectId}/assignment-links`, assignmentLink)
}

SDKFetch.prototype.createAssignmentLinks = createAssignmentLinksFetch

declare module '../../SDKFetch' {
  // tslint:disable-next-line: no-shadowed-variable
  interface SDKFetch {
    createAssignmentLinks: typeof createAssignmentLinksFetch
  }
}
