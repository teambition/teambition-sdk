import { SchemaDef, RDBType, Relationship } from 'reactivedb/interface'
import { schemaColl } from './schemas'
import {
  GroupId,
  UserId,
  OrganizationId,
  UserSnippet
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
  hasMembers?: Array<UserSnippet & {
    pinyin: string,
    py: string
  }>,
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
  created: {
    type: RDBType.DATE_TIME
  },
  hasMembers: {
    type: RDBType.OBJECT
  },
  isDeleted: {
    type: RDBType.BOOLEAN
  },
  logo: {
    type: RDBType.STRING
  },
  membersCount: {
    type: RDBType.NUMBER
  },
  name: {
    type: RDBType.STRING
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
  pinyin: {
    type: RDBType.STRING
  },
  py: {
    type: RDBType.STRING
  },
  updated: {
    type: RDBType.DATE_TIME
  }
}

schemaColl.add({ schema, name: 'Group' })
