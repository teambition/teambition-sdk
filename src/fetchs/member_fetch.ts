'use strict'
import BaseFetch from './base'
import {MemberData} from '../teambition'

export class MemberFetch extends BaseFetch {
  deleteMember(memberId: string): Promise<void> {
    return this.tbFetch.delete(`/members/${memberId}`)
  }

  getOrgMembers (organizationId: string): Promise<MemberData[]> {
    return this.tbFetch.get(`/V2/organizations/${organizationId}/members`)
  }

  getProjectMembers(projectId: string): Promise<MemberData[]> {
    return this.tbFetch.get(`/projects/${projectId}/members`)
  }
}

export default new MemberFetch()
