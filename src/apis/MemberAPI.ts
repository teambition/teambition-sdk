'use strict'
import * as Rx from 'rxjs'
import MemberFetch from '../fetchs/MemberFetch'
import MemberModel from '../models/MemberModel'
import Member from '../schemas/Member'
import { makeColdSignal, errorHandler } from './utils'

export class MemberAPI {

  constructor() {
    MemberModel.destructor()
  }

  deleteMember(memberId: string): Rx.Observable<void> {
    return Rx.Observable.fromPromise(MemberFetch.deleteMember(memberId))
      .concatMap(x => MemberModel.delete(memberId))
  }

  getOrgMembers (organizationId: string): Rx.Observable<Member[]> {
    return makeColdSignal<Member[]>(observer => {
      const get = MemberModel.getOrgMembers(organizationId)
      if (get) {
        return get
      }
      return Rx.Observable
        .fromPromise(MemberFetch.getOrgMembers(organizationId))
        .catch(err => errorHandler(observer, err))
        .concatMap(x => MemberModel.saveOrgMembers(organizationId, x))
    })
  }

  getProjectMembers(projectId: string): Rx.Observable<Member[]> {
    return makeColdSignal<Member[]>(observer => {
      const get = MemberModel.getProjectMembers(projectId)
      if (get) {
        return get
      }
      return Rx.Observable
        .fromPromise(MemberFetch.getProjectMembers(projectId))
        .catch(err => errorHandler(observer, err))
        .concatMap(x => MemberModel.saveProjectMembers(projectId, x))
    })
  }
}
