'use strict'
import BaseModel from './model'
import {datasToSchemas} from '../utils'
import Member from '../schemas/member_schema'
import {IMemberData} from 'teambition'

export default class MemberModel extends BaseModel {
  saveProjectMembers(projectId: string, members: IMemberData[]): Promise<Member[]> {
    const result = datasToSchemas<IMemberData, Member>(members, Member)
    return this._save(`members:${projectId}`, result)
  }

  getProjectMembers(projectId: string): Promise<Member[]> {
    return this._get<Array<Member>>(`members:${projectId}`)
  }

  removeMember(memberId: string): Promise<void> {
    return this._delete(memberId)
  }

  saveOrgMembers(organizationId: string, members: IMemberData[]): Promise<Member[]> {
    const result = datasToSchemas<IMemberData, Member>(members, Member)
    return this._save(`members:${organizationId}`, result)
    .then(() => {
      return result
    })
  }

  getOrgMembers(organizationId: string): Promise<Member[]> {
    return this._get<Array<Member>>(`members:${organizationId}`)
  }
}
