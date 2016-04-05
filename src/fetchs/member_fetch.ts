'use strict'
import BaseFetch from './base'
import {MemberData} from '../teambition'

export class MemberFetch extends BaseFetch {
  deleteMember(memberId: string): Promise<void> {
    return this.fetch.delete<void>(`/members/${memberId}`)
  }

  getOrgMembers (organizationId: string): Promise<MemberData[]> {
    return this.fetch.get<MemberData[]>(`/V2/organizations/${organizationId}/members`)
  }

  getProjectMembers(projectId: string): Promise<MemberData[]> {
    return this.fetch.get<MemberData[]>(`/projects/${projectId}/members`)
  }
}

export default new MemberFetch()
