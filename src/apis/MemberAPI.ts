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
    return MemberModel.getOrgMembers(organizationId)
      .concatMap(x => {
        if (x) return Rx.Observable.of(x)
        return Rx.Observable
          .fromPromise(memberFetch.getOrgMembers(organizationId))
          .concatMap(x => MemberModel.saveOrgMembers(organizationId, x))
      })
  }

  getProjectMembers(projectId: string): Rx.Observable<Member[]> {
    return MemberModel.getProjectMembers(projectId)
      .concatMap(x => {
        if (x) return Rx.Observable.of(x)
        return Rx.Observable
          .fromPromise(memberFetch.getProjectMembers(projectId))
          .concatMap(x => MemberModel.saveProjectMembers(projectId, x))
      })
  }
}
