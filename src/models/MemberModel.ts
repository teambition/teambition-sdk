'use strict'
import { Observable } from 'rxjs'
import BaseModel from './BaseModel'
import { datasToSchemas, forEach, dataToSchema } from '../utils/index'
import Member from '../schemas/Member'

export class MemberModel extends BaseModel {

  private _schemaName = 'Member'
  private _projectMembers = new Map<string, Member[]>()

  saveProjectMembers(projectId: string, members: Member[]): Observable<Member[]> {
    const result = datasToSchemas<Member>(members, Member)
    const dbIndex = `project:members/${projectId}`
    this._projectMembers.set(dbIndex, result)
    return this._saveCollection(dbIndex, result, this._schemaName, (data: Member) => {
      return data._boundToObjectId === projectId && data.boundToObjectType === 'project'
    }, '_memberId')
  }

  getProjectMembers(projectId: string): Observable<Member[]> {
    return this._get<Array<Member>>(`project:members/${projectId}`)
  }

  saveOrgMembers(organizationId: string, members: Member[]): Observable<Member[]> {
    const result = datasToSchemas<Member>(members, Member)
    return this._saveCollection(`organization:members/${organizationId}`, result, this._schemaName, (data: Member) => {
      return data._boundToObjectId === organizationId && data.boundToObjectType === 'organization'
    }, '_memberId')
  }

  getOrgMembers(organizationId: string): Observable<Member[]> {
    return this._get<Array<Member>>(`organization:members/${organizationId}`)
  }

  addProjectMembers(projectId: string, members: Member | Member[]): Observable<Member | Member[]> {
    const dbIndex = `project:members/${projectId}`
    if (members instanceof Array) {
      const result = datasToSchemas<Member>(members, Member)
      forEach(result, val => {
        this._projectMembers.get(dbIndex).push(val)
      })
      return this._updateCollection<Member>(dbIndex, this._projectMembers.get(dbIndex))
    }else {
      const result = dataToSchema<Member>(members, Member)
      return this._save(result, '_memberId')
        .take(1)
    }
  }
}

export default new MemberModel()
