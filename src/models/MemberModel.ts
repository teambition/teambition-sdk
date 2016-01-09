'use strict'
import BaseModel from './BaseModel'
import {forEach} from '../utils'
import {MemberSchema, Member} from '../schemas/member'
import {IMemberData} from 'teambition'

class MemberModel extends BaseModel {
  setProjectMembers(projectId: string, members: IMemberData[]) {
    const result = []
    forEach(members, (member: IMemberData) => {
      result.push(MemberSchema.$$setData(member))
    })
    this.setCollection(`members:${projectId}`, result)
    return result
  }

  getProjectMembers(projectId: string): Member[] {
    return this.getOne<Array<Member>>(`members:${projectId}`);
  }

  removeMember(memberId: string) {

  }
}

export default new MemberModel()
