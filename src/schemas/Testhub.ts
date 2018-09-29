import { RDBType, Relationship, SchemaDef } from 'reactivedb/interface'
import { OrganizationId, TesthubId, UserId, ExecutorOrCreator } from 'teambition-types'
import { CommonGroupSchema } from './CommonGroup'
import { schemaColl } from './schemas'

export interface TesthubSchema {
  _id: TesthubId
  _creatorId: UserId
  _organizationId: OrganizationId
  created: string
  creator: ExecutorOrCreator
  description: string
  groups: CommonGroupSchema[]
  logo: string
  name: string
  updated: string
}

const schema: SchemaDef<TesthubSchema> = {
  _creatorId: {
    type: RDBType.STRING
  },
  _id: {
    type: RDBType.STRING,
    primaryKey: true,
  },
  _organizationId: {
    type: RDBType.STRING,
  },
  created: {
    type: RDBType.DATE_TIME
  },
  creator: {
    type: Relationship.oneToOne,
    virtual: {
      name: 'User',
      where: (userTable: any) => ({
        _creatorId: userTable._id
      })
    }
  },
  description: {
    type: RDBType.STRING
  },
  groups: {
    type: Relationship.oneToMany,
    virtual: {
      name: 'CommonGroup',
      where: (commonGroupTable: any) => ({
        _id: commonGroupTable._boundToObjectId
      })
    }
  },
  logo: {
    type: RDBType.STRING
  },
  name: {
    type: RDBType.STRING
  },
  updated: {
    type: RDBType.DATE_TIME
  }
}

schemaColl.add({ name: 'Testhub', schema })
