'use strict'
import { Observable } from 'rxjs/Observable'
import BaseModel from './BaseModel'
import { datasToSchemas, forEach, dataToSchema } from '../utils/index'
import { default as Member, MemberData } from '../schemas/Member'

export class MemberModel extends BaseModel {

  private _schemaName = 'Member'
  private _projectMembers = new Map<string, MemberData[]>()

  saveProjectMembers(projectId: string, members: MemberData[]): Observable<MemberData[]> {
    const result = datasToSchemas<MemberData>(members, Member)
    const dbIndex = `project:members/${projectId}`
    this._projectMembers.set(dbIndex, result)
    return this._saveCollection(dbIndex, result, this._schemaName, (data: MemberData) => {
      return data._boundToObjectId === projectId && data.boundToObjectType === 'project'
    }, '_memberId')
  }

  getProjectMembers(projectId: string): Observable<MemberData[]> {
    return this._get<Array<MemberData>>(`project:members/${projectId}`)
  }

  saveOrgMembers(organizationId: string, members: MemberData[]): Observable<MemberData[]> {
    const result = datasToSchemas<MemberData>(members, Member)
    return this._saveCollection(`organization:members/${organizationId}`, result, this._schemaName, (data: MemberData) => {
      return data._boundToObjectId === organizationId && data.boundToObjectType === 'organization'
    }, '_memberId')
  }

  getOrgMembers(organizationId: string): Observable<MemberData[]> {
    return this._get<Array<MemberData>>(`organization:members/${organizationId}`)
  }

  addProjectMembers(projectId: string, members: MemberData | MemberData[]): Observable<MemberData | MemberData[]> {
    const dbIndex = `project:members/${projectId}`
    if (members instanceof Array) {
      const result = datasToSchemas<MemberData>(members, Member)
      forEach(result, val => {
        const cache = this._projectMembers.get(dbIndex)
        if (cache) {
          cache.push(val)
        }
      })
      return this._updateCollection<Member>(dbIndex, this._projectMembers.get(dbIndex))
    }else {
      const result = dataToSchema<MemberData>(members, Member)
      return this._save(result, '_memberId')
        .take(1)
    }
  }

  delete(_memberId: string): Observable<void> {
    return this._get<MemberData>(_memberId)
      .take(1)
      .concatMap(member => {
        const projectId = member._boundToObjectId
        const dbIndex = `project:members/${projectId}`
        const cache = this._projectMembers.get(dbIndex)
        if (cache && cache.length) {
          forEach(cache, (mem, index) => {
            if (mem._memberId === _memberId) {
              cache.splice(index, 1)
              return false
            }else {
              return null
            }
          })
        }
        return super.delete(_memberId)
      })
  }

  addOne(member: MemberData): Observable<MemberData> {
    const result = dataToSchema<MemberData>(member, Member)
    return this._save(result, '_memberId')
  }
}

export default new MemberModel()
