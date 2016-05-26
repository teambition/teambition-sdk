'use strict'
import BaseFetch from './BaseFetch'
import Member from '../schemas/Member'

export class MemberFetch extends BaseFetch {
  deleteMember(memberId: string): Promise<void> {
    return this.fetch.delete<void>(`members/${memberId}`)
  }

  getOrgMembers (organizationId: string): Promise<Member[]> {
    return this.fetch.get<Member[]>(`V2/organizations/${organizationId}/members`)
  }

  getProjectMembers(projectId: string): Promise<Member[]> {
    return this.fetch.get<Member[]>(`projects/${projectId}/members`)
  }

  updateRole(memberId: string, roleId: string): Promise<{roleId: string}> {
    return this.fetch.put(`members/${memberId}/_roleId`, {
      _roleId: roleId
    })
  }

  addProjectMember(_id: string, emails: string | any[]): Promise<Member> {
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
