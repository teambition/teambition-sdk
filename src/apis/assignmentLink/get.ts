import 'rxjs/add/operator/pluck'
import { Observable } from 'rxjs/Observable'
// import { QueryToken } from '../../db'
import { SDKFetch } from '../../SDKFetch'
// import { SDK, CacheStrategy } from '../../SDK'
import { ProjectId } from 'teambition-types'
import { AssignmentLinkSchema } from '../../schemas/AssignmentLink'

export function getAssignmentLinksFetch(
  this: SDKFetch,
  projectId: ProjectId
): Observable<AssignmentLinkSchema[]> {
  return this.get(`projects/${projectId}/assignment-links`)
    .pluck('result')
}

SDKFetch.prototype.getAssignmentLinks = getAssignmentLinksFetch

declare module '../../SDKFetch' {
  // tslint:disable-next-line: no-shadowed-variable
  interface SDKFetch {
    getAssignmentLinks: typeof getAssignmentLinksFetch
  }
}

// export function getAssignmentLinks(
//   this: SDK,
//   projectId: ProjectId
// ): QueryToken<AssignmentLinkSchema> {
//   return this.lift({
//     cacheValidate: CacheStrategy.Request,
//     tableName: 'AssignmentLink',
//     request: this.fetch.getAssignmentLinks(projectId),
//     query: {
//       where: {
//         _projectId: projectId
//       }
//     }
//   })
// }

// SDK.prototype.getAssignmentLinks = getAssignmentLinks

// declare module '../../SDK' {
//   // tslint:disable-next-line: no-shadowed-variable
//   interface SDK {
//     getAssignmentLinks: typeof getAssignmentLinks
//   }
// }
