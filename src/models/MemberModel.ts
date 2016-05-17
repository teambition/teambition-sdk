'use strict'
import {Observable} from 'rxjs'
import BaseModel from './BaseModel'
import {datasToSchemas} from '../utils/index'
import Member from '../schemas/Member'

export class MemberModel extends BaseModel<Member> {

  private _schemaName = 'Member'

  saveProjectMembers(projectId: string, members: Member[]): Observable<Member[]> {
    const result = datasToSchemas<Member, Member>(members, Member)
    return this._saveCollection(`project:members/${projectId}`, result, this._schemaName)
  }

  getProjectMembers(projectId: string): Observable<Member[]> {
    return this._get<Array<Member>>(`project:members/${projectId}`)
  }

  saveOrgMembers(organizationId: string, members: Member[]): Observable<Member[]> {
    const result = datasToSchemas<Member, Member>(members, Member)
    return this._saveCollection(`organization:members/${organizationId}`, result, this._schemaName)
  }

  getOrgMembers(organizationId: string): Observable<Member[]> {
    return this._get<Array<Member>>(`organization:members/${organizationId}`)
  }
}

export default new MemberModel()
