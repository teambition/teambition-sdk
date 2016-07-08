'use strict'
import BaseFetch from './BaseFetch'
import { MemberData } from '../schemas/Member'

export class MemberFetch extends BaseFetch {
  deleteMember(memberId: string): Promise<void> {
    return this.fetch.delete<void>(`members/${memberId}`)
  }

  getOrgMembers (organizationId: string): Promise<MemberData[]> {
    return this.fetch.get<MemberData[]>(`V2/organizations/${organizationId}/members`)
  }

  getProjectMembers(projectId: string): Promise<MemberData[]> {
    return this.fetch.get<MemberData[]>(`projects/${projectId}/members`)
  }

  updateRole(memberId: string, roleId: string): Promise<{roleId: string}> {
    return this.fetch.put(`members/${memberId}/_roleId`, {
      _roleId: roleId
    })
  }

  addProjectMembers(_id: string, emails: string | string[]): Promise<MemberData> {
    return this.fetch.post(`v2/projects/${_id}/members`, {
      email: emails
    })
  }

  addProjectMemberByCode(_id: string, signCode: string, invitorId: string): Promise<void> {
    return this.fetch.post<void>(`projects/${_id}/joinByCode${signCode}`, {
      _invitorId: invitorId
    })
  }
}

export default new MemberFetch()
