'use strict'
import 'rxjs/add/operator/switchMap'
import { Observable } from 'rxjs/Observable'
import BaseFetch from './BaseFetch'
import { MemberData } from '../schemas/Member'
import { concat } from '../utils/index'

export interface GetMembersOptions {
  limit?: number
  page?: number
  count?: number
}

const MAX_PROJECT_MEMBER_COUNT = 1000

export class MemberFetch extends BaseFetch {
  deleteMember(memberId: string): Observable<void> {
    return this.fetch.delete<void>(`members/${memberId}`)
  }

  getOrgMembers (organizationId: string, query?: GetMembersOptions): Observable<MemberData[]> {
    return this.fetch.get<MemberData[]>(`V2/organizations/${organizationId}/members`, query)
  }

  getAllOrgMembers (organizationId: string): Observable<MemberData[]>

  getAllOrgMembers (organizationId: string, page = 1, result: MemberData[] = []): Observable<MemberData[]> {
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

  getProjectMembers(projectId: string, query?: GetMembersOptions): Observable<MemberData[]> {
    return this.fetch.get<MemberData[]>(`projects/${projectId}/members`, query)
  }

  getAllProjectMembers(projectId: string): Observable<MemberData[]>

  getAllProjectMembers(projectId: string, page = 1, result: MemberData[] = []): Observable<MemberData[]> {
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

  updateRole(memberId: string, roleId: string): Observable<{roleId: string}> {
    return this.fetch.put(`members/${memberId}/_roleId`, {
      _roleId: roleId
    })
  }

  addProjectMembers(_id: string, emails: string): Observable<MemberData>

  addProjectMembers(_id: string, emails: string[]): Observable<MemberData[]>

  addProjectMembers(_id: string, emails: string | string[]): Observable<MemberData> | Observable<MemberData[]>

  addProjectMembers(_id: string, emails: string | string[]): Observable<MemberData> | Observable<MemberData[]> {
    return this.fetch.post(`v2/projects/${_id}/members`, {
      email: emails
    })
  }

  addProjectMemberByCode(_id: string, signCode: string, invitorId: string): Observable<void> {
    return this.fetch.post<void>(`projects/${_id}/joinByCode${signCode}`, {
      _invitorId: invitorId
    })
  }
}

export default new MemberFetch()
