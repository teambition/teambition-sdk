'use strict'
import BaseModel from './model'
import {datasToSchemas} from '../utils'
import Member from '../schemas/member_schema'
import {IMemberData} from 'teambition'

export default class MemberModel extends BaseModel {
  saveProjectMembers(projectId: string, members: IMemberData[]): Member[] {
    const result = datasToSchemas<IMemberData, Member>(members, Member)
    this._save(`members:${projectId}`, result)
    return result
  }

  getProjectMembers(projectId: string): Member[] {
    return this._get<Array<Member>>(`members:${projectId}`)
  }

  removeMember(memberId: string) {
    this._delete(memberId)
  }

  saveOrgMembers(organizationId: string, members: IMemberData[]): Member[] {
    const result = datasToSchemas<IMemberData, Member>(members, Member)
    this._save(`members:${organizationId}`, result)
    return result
  }

  getOrgMembers(organizationId: string): Member[] {
    return this._get<Array<Member>>(`members:${organizationId}`)
  }
}
