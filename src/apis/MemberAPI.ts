'use strict'
import { Observable } from 'rxjs/Observable'
import MemberFetch from '../fetchs/MemberFetch'
import MemberModel from '../models/MemberModel'
import { MemberData } from '../schemas/Member'
import { makeColdSignal } from './utils'

export class MemberAPI {

  getOne(memberId: string, query?: any): Observable<MemberData> {
    return makeColdSignal<MemberData>(() => {
      const cache = MemberModel.getOne(memberId)
      if (cache && MemberModel.checkSchema(memberId)) {
        return cache
      }
      return MemberFetch.getOne(memberId, query)
        .concatMap(member => MemberModel.addOne(member))
    })
  }

  deleteMember(memberId: string): Observable<void> {
    return MemberFetch.deleteMember(memberId)
      .concatMap(x => MemberModel.delete(memberId))
  }

  getOrgMembers (organizationId: string, page = 1, count = 30): Observable<MemberData[]> {
    return makeColdSignal<MemberData[]>(() => {
      const get = MemberModel.getOrgMembers(organizationId, page)
      if (get) {
        return get
      }
      return MemberFetch.getOrgMembers(organizationId, { page, count })
        .concatMap(x => MemberModel.saveOrgMembers(organizationId, x, page, count))
    })
  }

  getAllOrgMembers (organizationId: string): Observable<MemberData[]> {
    return makeColdSignal<MemberData[]>(() => {
      const cache = MemberModel.getAllOrgMembers(organizationId)
      if (cache) {
        return cache
      }
      return MemberFetch.getAllOrgMembers(organizationId)
        .concatMap(r => MemberModel.saveAllOrgMembers(organizationId, r))
    })
  }

  getProjectMembers(projectId: string, page = 1, count = 30): Observable<MemberData[]> {
    return makeColdSignal<MemberData[]>(() => {
      const get = MemberModel.getProjectMembers(projectId, page)
      if (get) {
        return get
      }
      return MemberFetch.getProjectMembers(projectId, { page, count })
        .concatMap(x => MemberModel.saveProjectMembers(projectId, x, page, count))
    })
  }

  getAllProjectMembers(projectId: string): Observable<MemberData[]> {
    return makeColdSignal<MemberData[]>(() => {
      const cache = MemberModel.getAllProjectMembers(projectId)
      if (cache) {
        return cache
      }
      return MemberFetch.getAllProjectMembers(projectId)
        .concatMap(r => MemberModel.saveAllProjectMembers(projectId, r))
    })
  }

  addMembers(_projectId: string, emails: string): Observable<MemberData>

  addMembers(_projectId: string, emails: string[]): Observable<MemberData[]>

  addMembers(_projectId: string, emails: string | string[]): Observable<MemberData> | Observable<MemberData[]>

  /**
   * 设计时是考虑到可以增加任意类型的 member
   * 比如项目加人时可调用，组织加人时也可以调用
   */
  addMembers(_projectId: string, emails: string | string[]): Observable<MemberData> | Observable<MemberData[]> {
    return MemberFetch.addProjectMembers(_projectId, <string[]>emails)
      .concatMap(r => MemberModel.addProjectMembers(_projectId, r))
  }
}

export default new MemberAPI
