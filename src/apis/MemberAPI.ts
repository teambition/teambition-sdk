'use strict'
import * as Rx from 'rxjs'
import {MemberFetch} from '../fetchs/MemberFetch'
import MemberModel from '../models/MemberModel'
import Member from '../schemas/Member'
import {MemberData} from '../teambition'

const memberFetch = new MemberFetch()

export class MemberAPI {

  deleteMember(memberId: string): Rx.Observable<void> {
    return Rx.Observable.fromPromise(memberFetch.deleteMember(memberId))
      .concatMap(x => MemberModel.removeMember(memberId))
  }

  getOrgMembers (organizationId: string): Rx.Observable<Member[]> {
    const get = MemberModel.getOrgMembers(organizationId)
    if (get) return get
    return Rx.Observable
      .fromPromise(memberFetch.getOrgMembers(organizationId))
      .concatMap(x => MemberModel.saveOrgMembers(organizationId, x))
  }

  getProjectMembers(projectId: string): Rx.Observable<Member[]> {
    const get = MemberModel.getProjectMembers(projectId)
    if (get) return get
    return Rx.Observable
      .fromPromise(memberFetch.getProjectMembers(projectId))
      .concatMap(x => MemberModel.saveProjectMembers(projectId, x))
  }
}
