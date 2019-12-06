import { Observable } from 'rxjs/Observable'
import { SDKFetch } from '../../SDKFetch'
import { ProjectId, AssignmentLinkId } from 'teambition-types'

export function deleteAssignmentLinksFetch(
  this: SDKFetch,
  projectId: ProjectId,
  linkId: AssignmentLinkId,
): Observable<{ id: AssignmentLinkId }> {
  return this.delete(`projects/${projectId}/assignment-links/${linkId}`)
}

SDKFetch.prototype.deleteAssignmentLinks = deleteAssignmentLinksFetch

declare module '../../SDKFetch' {
  // tslint:disable-next-line: no-shadowed-variable
  interface SDKFetch {
    deleteAssignmentLinks: typeof deleteAssignmentLinksFetch
  }
}
