import { Observable } from 'rxjs/Observable'
import { SDKFetch } from '../../SDKFetch'
import { ProjectId, AssignmentLinkId } from 'teambition-types'
import { AssignmentLinkSchema } from '../../schemas/AssignmentLink'

type AssignmentLink = Pick<
  AssignmentLinkSchema,
  'name' | '_assignedProjectId' | '_executorId' | 'assignmentType'
>

export function updateAssignmentLinksFetch(
  this: SDKFetch,
  projectId: ProjectId,
  linkId: AssignmentLinkId,
  assignmentLink: AssignmentLink
): Observable<AssignmentLinkSchema> {
  return this.put(`projects/${projectId}/assignment-links/${linkId}`, assignmentLink)
}

SDKFetch.prototype.updateAssignmentLinks = updateAssignmentLinksFetch

declare module '../../SDKFetch' {
  // tslint:disable-next-line: no-shadowed-variable
  interface SDKFetch {
    updateAssignmentLinks: typeof updateAssignmentLinksFetch
  }
}
