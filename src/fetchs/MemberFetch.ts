'use strict'
import 'rxjs/add/operator/switchMap'
import { Observable } from 'rxjs/Observable'
import BaseFetch from './BaseFetch'
import { MemberData } from '../schemas/Member'
import { concat } from '../utils/index'
import {
  MemberId,
  UserId,
  OrganizationId,
  ProjectId,
  RoleId
} from '../teambition'

export interface GetMembersOptions {
  limit?: number
  page?: number
  count?: number
}

const MAX_PROJECT_MEMBER_COUNT = 1000

export class MemberFetch extends BaseFetch {

  getOne(memberId: MemberId, query?: any): Observable<MemberData> {
    return this.fetch.get(`members/${memberId}`, query)
  }

  deleteMember(memberId: MemberId): Observable<void> {
    return this.fetch.delete<void>(`members/${memberId}`)
  }

  getOrgMembers (organizationId: OrganizationId, query?: GetMembersOptions): Observable<MemberData[]> {
    return this.fetch.get<MemberData[]>(`V2/organizations/${organizationId}/members`, query)
  }

  getAllOrgMembers (organizationId: OrganizationId): Observable<MemberData[]>

  getAllOrgMembers (organizationId: OrganizationId, page?: number, result?: MemberData[]): Observable<MemberData[]>

  getAllOrgMembers (organizationId: OrganizationId, page = 1, result: MemberData[] = []): Observable<MemberData[]> {
    return this.getOrgMembers(organizationId, {
      page, count: MAX_PROJECT_MEMBER_COUNT
    })
      .switchMap<MemberData[]>(r => {
        concat(result, r)
        if (r.length === MAX_PROJECT_MEMBER_COUNT) {
          page ++
          return (<any>this.getAllOrgMembers)(organizationId, page, result)
        }
        return Observable.of(result)
      })
  }

  getProjectMembers(projectId: ProjectId, query?: GetMembersOptions): Observable<MemberData[]> {
    return this.fetch.get<MemberData[]>(`projects/${projectId}/members`, query)
  }

  getAllProjectMembers(projectId: ProjectId): Observable<MemberData[]>

  getAllProjectMembers(projectId: ProjectId, page?: number, result?: MemberData[]): Observable<MemberData[]>

  getAllProjectMembers(projectId: ProjectId, page = 1, result: MemberData[] = []): Observable<MemberData[]> {
    return this.getProjectMembers(projectId, {
      page, count: MAX_PROJECT_MEMBER_COUNT
    })
      .switchMap<MemberData[]>(r => {
        concat(result, r)
        if (r.length === MAX_PROJECT_MEMBER_COUNT) {
          page ++
          return (<any>this.getAllProjectMembers)(projectId, page, result)
        }
        return Observable.of(result)
      })
  }

  updateRole(memberId: MemberId, roleId: RoleId): Observable<{roleId: string}> {
    return this.fetch.put(`members/${memberId}/_roleId`, {
      _roleId: roleId
    })
  }

  addProjectMembers(_id: ProjectId, emails: string): Observable<MemberData>

  addProjectMembers(_id: ProjectId, emails: string[]): Observable<MemberData[]>

  addProjectMembers(_id: ProjectId, emails: string | string[]): Observable<MemberData> | Observable<MemberData[]>

  addProjectMembers(_id: ProjectId, emails: string | string[]): Observable<MemberData> | Observable<MemberData[]> {
    return this.fetch.post(`v2/projects/${_id}/members`, {
      email: emails
    })
  }

  addProjectMemberByCode(_id: ProjectId, signCode: string, invitorId: UserId): Observable<void> {
    return this.fetch.post<void>(`projects/${_id}/joinByCode${signCode}`, {
      _invitorId: invitorId
    })
  }
}

export default new MemberFetch
