'use strict'
import { Observable } from 'rxjs/Observable'
import BaseModel from './BaseModel'
import Collection from './BaseCollection'
import { datasToSchemas, forEach, dataToSchema } from '../utils/index'
import { default as Member, MemberData } from '../schemas/Member'
import { MemberId, ProjectId, OrganizationId } from '../teambition'

export class MemberModel extends BaseModel {

  private _schemaName = 'Member'

  saveProjectMembers(projectId: ProjectId, members: MemberData[], page: number, count: number): Observable<MemberData[]> {
    const result = datasToSchemas<MemberData>(members, Member)
    const dbIndex = `project:members/${projectId}`

    let collection: Collection<MemberData> = this._collections.get(dbIndex)

    if (!collection) {
      collection = new Collection<MemberData>(this._schemaName, data => {
        return data._boundToObjectId === projectId && data.boundToObjectType === 'project'
      }, dbIndex, count, '_memberId')
      this._collections.set(dbIndex, collection)
    }
    return collection.addPage(page, result)
  }

  saveAllProjectMembers(projectId: ProjectId, members: MemberData[]): Observable<MemberData[]> {
    const result = datasToSchemas(members, Member)
    const dbIndex = `project:members:all/${projectId}`

    return this._saveCollection(dbIndex, result, this._schemaName, data => {
      return data._boundToObjectId === projectId && data.boundToObjectType === 'project'
    }, '_memberId')
  }

  getAllProjectMembers(projectId: ProjectId): Observable<MemberData[]> {
    return this._get<MemberData[]>(`project:members:all/${projectId}`)
  }

  getProjectMembers(projectId: ProjectId, page: number): Observable<MemberData[]> {
    const collection = this._collections.get(`project:members/${projectId}`)
    if (collection) {
      return collection.get(page)
    }
    return null
  }

  saveOrgMembers(organizationId: OrganizationId, members: MemberData[], page: number, count: number): Observable<MemberData[]> {
    const result = datasToSchemas<MemberData>(members, Member)
    const dbIndex = `organization:members/${organizationId}`

    let collection = this._collections.get(dbIndex)

    if (!collection) {
      collection = new Collection<MemberData>(this._schemaName, data => {
        return data._boundToObjectId === organizationId && data.boundToObjectType === 'organization'
      }, dbIndex, count, '_memberId')
      this._collections.set(dbIndex, collection)
    }
    return collection.addPage(page, result)
  }

  saveAllOrgMembers(organizationId: OrganizationId, members: MemberData[]): Observable<MemberData[]> {
    const result = datasToSchemas(members, Member)
    const dbIndex = `organization:all:members/${organizationId}`

    return this._saveCollection(dbIndex, result, this._schemaName, data => {
      return data._boundToObjectId === organizationId && data.boundToObjectType === 'organization'
    }, '_memberId')
  }

  getOrgMembers(organizationId: OrganizationId, page: number): Observable<MemberData[]> {
    const collection = this._collections.get(`organization:members/${organizationId}`)
    if (collection) {
      return collection.get(page)
    }
    return null
  }

  getAllOrgMembers(organizationId: OrganizationId): Observable<MemberData[]> {
    return this._get<MemberData[]>(`organization:all:members/${organizationId}`)
  }

  addProjectMembers(projectId: ProjectId, members: MemberData): Observable<MemberData>

  addProjectMembers(projectId: ProjectId, members: MemberData[]): Observable<MemberData[]>

  addProjectMembers(projectId: ProjectId, members: MemberData | MemberData[]): Observable<MemberData | MemberData[]>

  addProjectMembers(projectId: ProjectId, members: MemberData | MemberData[]): Observable<MemberData | MemberData[]> {
    const dbIndex = `project:members/${projectId}`
    if (members instanceof Array) {
      let collection = this._collections.get(dbIndex)
      if (collection) {
        const signals: Observable<MemberData>[] = []
        forEach(members, val => {
          const result = dataToSchema(val, Member)
          signals.push(this._save<MemberData>(result, '_memberId'))
        })
        return Observable.from(signals)
          .mergeAll()
          .skip(signals.length - 1)
          .take(1)
          .map(() => members)
      } else {
        return this.saveProjectMembers(projectId, members, 1, 30)
          .take(1)
      }
    } else {
      const result = dataToSchema<MemberData>(members, Member)
      return this._save(result, '_memberId')
        .take(1)
    }
  }

  getOne(memberId: MemberId): Observable<MemberData> | null {
    return this._get<MemberData>(<any>memberId)
  }

  addOne(member: MemberData): Observable<MemberData> {
    const result = dataToSchema<MemberData>(member, Member)
    return this._save(result, '_memberId')
  }
}

export default new MemberModel
