'use strict'
import BaseFetch from './base'
import Member from '../schemas/Member'

export class MemberFetch extends BaseFetch {
  deleteMember(memberId: string): Promise<void> {
    return this.fetch.delete<void>(`/members/${memberId}`)
  }

  getOrgMembers (organizationId: string): Promise<Member[]> {
    return this.fetch.get<Member[]>(`/V2/organizations/${organizationId}/members`)
  }

  getProjectMembers(projectId: string): Promise<Member[]> {
    return this.fetch.get<Member[]>(`/projects/${projectId}/members`)
  }
}
