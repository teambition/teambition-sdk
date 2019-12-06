import { Observable } from 'rxjs/Observable'
import { SDK } from '../../SDK'
import { SDKFetch } from '../../SDKFetch'
import { ProjectId, AssignmentLinkId } from 'teambition-types'
import { AssignmentLinkSchema } from '../../schemas/AssignmentLink'

type AssignmentLink = Pick<
  AssignmentLinkSchema,
  'name' | '_assignedProjectId' | '_executorId' | 'assignmentType'
>

export function updateAssignmentLinkFetch(
  this: SDKFetch,
  projectId: ProjectId,
  linkId: AssignmentLinkId,
  assignmentLink: AssignmentLink
): Observable<AssignmentLinkSchema> {
  return this.put(`projects/${projectId}/assignment-links/${linkId}`, assignmentLink)
}

SDKFetch.prototype.updateAssignmentLink = updateAssignmentLinkFetch

declare module '../../SDKFetch' {
  // tslint:disable-next-line: no-shadowed-variable
  interface SDKFetch {
    updateAssignmentLink: typeof updateAssignmentLinkFetch
  }
}

export function updateAssignmentLink(
  this: SDK,
  projectId: ProjectId,
  linkId: AssignmentLinkId,
  assignmentLink: AssignmentLink
): Observable<AssignmentLinkSchema> {
  return this.lift({
    request: this.fetch.updateAssignmentLink(projectId, linkId, assignmentLink),
    tableName: 'AssignmentLink',
    method: 'update',
    clause: { _id: linkId }
  })
}

SDK.prototype.updateAssignmentLink = updateAssignmentLink

declare module '../../SDK' {
  export interface SDK {
    updateAssignmentLink: typeof updateAssignmentLink
  }
}
