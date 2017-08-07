import { SchemaDef, RDBType, Relationship } from 'reactivedb/interface'
import { schemas } from '../SDK'
import {
  GroupId,
  UserId,
  OrganizationId
} from 'teambition-types'

export interface GroupSchema {
  _id: GroupId,
  _creatorId: UserId,
  _organizationId: OrganizationId,
  isDeleted?: boolean,
  name: string,
  logo: string,
  pinyin: string,
  py: string,
  created: string,
  updated: string,
  membersCount: number,
  organization?: {
    name: string,
    description: string,
    logo: string,
    isPublic: boolean,
    _id: OrganizationId,
    isExpired: boolean,
    plan: {
      status: string,
      expired: string,
      paidCount: number,
      membersCount: number,
      days: number,
      objectType: string,
      isExpired: boolean
    }
  }
}

const schema: SchemaDef<GroupSchema> = {
  _id: {
    type: RDBType.STRING,
    primaryKey: true
  },
  _creatorId: {
    type: RDBType.STRING
  },
  _organizationId: {
    type: RDBType.STRING
  },
  isDeleted: {
    type: RDBType.BOOLEAN
  },
  name: {
    type: RDBType.STRING
  },
  logo: {
    type: RDBType.STRING
  },
  pinyin: {
    type: RDBType.STRING
  },
  py: {
    type: RDBType.STRING
  },
  created: {
    type: RDBType.DATE_TIME
  },
  updated: {
    type: RDBType.DATE_TIME
  },
  membersCount: {
    type: RDBType.NUMBER
  },
  organization: {
    type: Relationship.oneToOne,
    virtual: {
      name: 'Organization',
      where: (OrganizationTable: any) => ({
        _organizationId: OrganizationTable._id
      })
    }
  },
}

schemas.push({ schema, name: 'Group' })
