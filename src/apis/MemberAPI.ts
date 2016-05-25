'use strict'
import * as Rx from 'rxjs'
import { MemberFetch } from '../fetchs/MemberFetch'
import MemberModel from '../models/MemberModel'
import Member from '../schemas/Member'

const memberFetch = new MemberFetch()

export class MemberAPI {

  constructor() {
    MemberModel.destructor()
  }

  deleteMember(memberId: string): Rx.Observable<void> {
    return Rx.Observable.fromPromise(memberFetch.deleteMember(memberId))
      .concatMap(x => MemberModel.delete(memberId))
  }

  getOrgMembers (organizationId: string): Rx.Observable<Member[]> {
    const get = MemberModel.getOrgMembers(organizationId)
    if (get) {
      return get
    }
    return Rx.Observable
      .fromPromise(memberFetch.getOrgMembers(organizationId))
      .concatMap(x => MemberModel.saveOrgMembers(organizationId, x))
  }

  getProjectMembers(projectId: string): Rx.Observable<Member[]> {
    const get = MemberModel.getProjectMembers(projectId)
    if (get) {
      return get
    }
    return Rx.Observable
      .fromPromise(memberFetch.getProjectMembers(projectId))
      .concatMap(x => MemberModel.saveProjectMembers(projectId, x))
  }
}
