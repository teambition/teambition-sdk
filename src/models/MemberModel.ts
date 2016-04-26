'use strict'
import {Observable} from 'rxjs'
import BaseModel from './model'
import {datasToSchemas} from '../utils/index'
import Member from '../schemas/Member'

export class MemberModel extends BaseModel {
  saveProjectMembers(projectId: string, members: Member[]): Observable<Member[]> {
    const result = datasToSchemas<Member, Member>(members, Member)
    return this._save(`members:${projectId}`, result)
  }

  getProjectMembers(projectId: string): Observable<Member[]> {
    return this._get<Array<Member>>(`members:${projectId}`)
  }

  removeMember(memberId: string): Observable<void> {
    return this._delete(memberId)
  }

  saveOrgMembers(organizationId: string, members: Member[]): Observable<Member[]> {
    const result = datasToSchemas<Member, Member>(members, Member)
    return this._save(`members:${organizationId}`, result)
  }

  getOrgMembers(organizationId: string): Observable<Member[]> {
    return this._get<Array<Member>>(`members:${organizationId}`)
  }
}

export default new MemberModel()
