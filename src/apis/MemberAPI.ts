'use strict'
import { Observable } from 'rxjs/Observable'
import { Observer } from 'rxjs/Observer'
import MemberFetch from '../fetchs/MemberFetch'
import MemberModel from '../models/MemberModel'
import { MemberData } from '../schemas/Member'
import { makeColdSignal, errorHandler, observableError } from './utils'

export class MemberAPI {

  constructor() {
    MemberModel.destructor()
  }

  deleteMember(memberId: string): Observable<void> {
    return Observable.fromPromise(MemberFetch.deleteMember(memberId))
      .concatMap(x => MemberModel.delete(memberId))
  }

  getOrgMembers (organizationId: string, page = 1, count = 30): Observable<MemberData[]> {
    return makeColdSignal<MemberData[]>(observer => {
      const get = MemberModel.getOrgMembers(organizationId, page)
      if (get) {
        return get
      }
      return Observable
        .fromPromise(MemberFetch.getOrgMembers(organizationId, {
          page,
          count
        }))
        .catch(err => errorHandler(observer, err))
        .concatMap(x => MemberModel.saveOrgMembers(organizationId, x, page, count))
    })
  }

  getAllOrgMembers (organizationId: string): Observable<MemberData[]> {
    return makeColdSignal<MemberData[]>(observer => {
      const cache = MemberModel.getAllOrgMembers(organizationId)
      if (cache) {
        return cache
      }
      return Observable.fromPromise(MemberFetch.getAllOrgMembers(organizationId))
        .catch(err => errorHandler(observer, err))
        .concatMap(r => MemberModel.saveAllOrgMembers(organizationId, r))
    })
  }

  getProjectMembers(projectId: string, page = 1, count = 30): Observable<MemberData[]> {
    return makeColdSignal<MemberData[]>(observer => {
      const get = MemberModel.getProjectMembers(projectId, page)
      if (get) {
        return get
      }
      return Observable
        .fromPromise(MemberFetch.getProjectMembers(projectId, { page, count }))
        .catch(err => errorHandler(observer, err))
        .concatMap(x => MemberModel.saveProjectMembers(projectId, x, page, count))
    })
  }

  getAllProjectMembers(projectId: string): Observable<MemberData[]> {
    return makeColdSignal<MemberData[]>(observer => {
      const cache = MemberModel.getAllProjectMembers(projectId)
      if (cache) {
        return cache
      }
      return Observable.fromPromise(MemberFetch.getAllProjectMembers(projectId))
        .catch(err => errorHandler(observer, err))
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
    return Observable.create((observer: Observer<MemberData | MemberData[]>) => {
      Observable.fromPromise(MemberFetch.addProjectMembers(_projectId, <string[]>emails))
        .catch((err: any) => observableError(observer, err))
        .concatMap(r => MemberModel.addProjectMembers(_projectId, r))
        .forEach(r => observer.next(r))
        .then(() => observer.complete())
    })
  }
}
