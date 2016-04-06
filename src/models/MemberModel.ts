'use strict'
import BaseModel from './model'
import {datasToSchemas} from '../utils/index'
import Member from '../schemas/Member'
import {MemberData} from '../teambition'

export default class MemberModel extends BaseModel {
  saveProjectMembers(projectId: string, members: MemberData[]): Promise<Member[]> {
    const result = datasToSchemas<MemberData, Member>(members, Member)
    return this._save(`members:${projectId}`, result)
  }

  getProjectMembers(projectId: string): Promise<Member[]> {
    return this._get<Array<Member>>(`members:${projectId}`)
  }

  removeMember(memberId: string): Promise<void> {
    return this._delete(memberId)
  }

  saveOrgMembers(organizationId: string, members: MemberData[]): Promise<Member[]> {
    const result = datasToSchemas<MemberData, Member>(members, Member)
    return this._save(`members:${organizationId}`, result)
    .then(() => {
      return result
    })
  }

  getOrgMembers(organizationId: string): Promise<Member[]> {
    return this._get<Array<Member>>(`members:${organizationId}`)
  }
}
