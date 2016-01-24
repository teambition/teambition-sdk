'use strict'
import BaseModel from './model'
import {forEach} from '../utils'
import Member from '../schemas/member_schema'
import {setSchema} from '../schemas/schema'
import {IMemberData} from 'teambition'

class MemberModel extends BaseModel {
  setProjectMembers(projectId: string, members: IMemberData[]): Member[] {
    const result = []
    forEach(members, (member: IMemberData) => {
      result.push(setSchema<Member>(new Member(), member))
    })
    this.setCollection(`members:${projectId}`, result)
    return result
  }

  getProjectMembers(projectId: string): Member[] {
    return this.getOne<Array<Member>>(`members:${projectId}`)
  }

  removeMember(memberId: string) {
    this.removeOne(memberId)
  }

  setOrgMember(organizationId: string, members: IMemberData[]): Member[] {
    const result = []
    forEach(members, (member: IMemberData) => {
      result.push(setSchema(new Member(), member))
    })
    this.setCollection(`members:${organizationId}`, result)
    return result
  }

  getOrgMember(organizationId: string): Member[] {
    return this.getOne<Array<Member>>(`members:${organizationId}`)
  }
}

export default new MemberModel()
