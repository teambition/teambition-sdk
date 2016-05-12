'use strict'
import * as Rx from 'rxjs'
import {MemberFetch} from '../fetchs/MemberFetch'
import MemberModel from '../models/MemberModel'
import Member from '../schemas/Member'

const memberFetch = new MemberFetch()

export class MemberAPI {

  private MemberModel: MemberModel

  constructor() {
    this.MemberModel = new MemberModel()
  }

  deleteMember(memberId: string): Rx.Observable<void> {
    return Rx.Observable.fromPromise(memberFetch.deleteMember(memberId))
      .concatMap(x => this.MemberModel.delete(memberId))
  }

  getOrgMembers (organizationId: string): Rx.Observable<Member[]> {
    const get = this.MemberModel.getOrgMembers(organizationId)
    if (get) return get
    return Rx.Observable
      .fromPromise(memberFetch.getOrgMembers(organizationId))
      .concatMap(x => this.MemberModel.saveOrgMembers(organizationId, x))
  }

  getProjectMembers(projectId: string): Rx.Observable<Member[]> {
    const get = this.MemberModel.getProjectMembers(projectId)
    if (get) return get
    return Rx.Observable
      .fromPromise(memberFetch.getProjectMembers(projectId))
      .concatMap(x => this.MemberModel.saveProjectMembers(projectId, x))
  }
}
