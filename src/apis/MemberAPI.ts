'use strict'
import { Observable } from 'rxjs/Observable'
import { Observer } from 'rxjs/Observer'
import MemberFetch from '../fetchs/MemberFetch'
import MemberModel from '../models/MemberModel'
import Member from '../schemas/Member'
import { makeColdSignal, errorHandler, observableError } from './utils'

export class MemberAPI {

  constructor() {
    MemberModel.destructor()
  }

  deleteMember(memberId: string): Observable<void> {
    return Observable.fromPromise(MemberFetch.deleteMember(memberId))
      .concatMap(x => MemberModel.delete(memberId))
  }

  getOrgMembers (organizationId: string): Observable<Member[]> {
    return makeColdSignal<Member[]>(observer => {
      const get = MemberModel.getOrgMembers(organizationId)
      if (get) {
        return get
      }
      return Observable
        .fromPromise(MemberFetch.getOrgMembers(organizationId))
        .catch(err => errorHandler(observer, err))
        .concatMap(x => MemberModel.saveOrgMembers(organizationId, x))
    })
  }

  getProjectMembers(projectId: string): Observable<Member[]> {
    return makeColdSignal<Member[]>(observer => {
      const get = MemberModel.getProjectMembers(projectId)
      if (get) {
        return get
      }
      return Observable
        .fromPromise(MemberFetch.getProjectMembers(projectId))
        .catch(err => errorHandler(observer, err))
        .concatMap(x => MemberModel.saveProjectMembers(projectId, x))
    })
  }

  /**
   * 设计时是考虑到可以增加任意类型的 member
   * 比如项目加人时可调用，组织加人时也可以调用
   */
  addMembers(_projectId: string, emails: string[]): Observable<Member | Member[]> {
    return Observable.create((observer: Observer<Member | Member[]>) => {
      Observable.fromPromise(MemberFetch.addProjectMembers(_projectId, emails))
        .catch(err => observableError(observer, err))
        .concatMap(r => MemberModel.addProjectMembers(_projectId, r))
        .forEach(r => observer.next(r))
        .then(r => observer.complete())
    })
  }
}
