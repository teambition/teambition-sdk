import { Observable } from 'rxjs/Observable'
import { SDK, CacheStrategy } from '../../SDK'
import { SDKFetch } from '../../SDKFetch'
import { ProjectId, AssignmentLinkId } from 'teambition-types'

export function deleteAssignmentLinkFetch(
  this: SDKFetch,
  projectId: ProjectId,
  linkId: AssignmentLinkId,
): Observable<void> {
  return this.delete(`projects/${projectId}/assignment-links/${linkId}`)
}

SDKFetch.prototype.deleteAssignmentLink = deleteAssignmentLinkFetch

declare module '../../SDKFetch' {
  // tslint:disable-next-line: no-shadowed-variable
  interface SDKFetch {
    deleteAssignmentLink: typeof deleteAssignmentLinkFetch
  }
}

export function deleteAssignmentLink(
  this: SDK,
  projectId: ProjectId,
  linkId: AssignmentLinkId,
): Observable<void> {
  return this.lift<void>({
    request: this.fetch.deleteAssignmentLink(projectId, linkId),
    tableName: 'AssignmentLink',
    method: 'delete',
    clause: { _id: linkId }
  })
}

SDK.prototype.deleteAssignmentLink = deleteAssignmentLink

declare module '../../SDK' {
  export interface SDK {
    deleteAssignmentLink: typeof deleteAssignmentLink
  }
}
