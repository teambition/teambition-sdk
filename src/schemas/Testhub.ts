import { RDBType, Relationship, SchemaDef } from 'reactivedb/interface'
import { TesthubId, UserId } from 'teambition-types'
import { CommonGroupSchema } from './CommonGroup'
import { schemaColl } from './schemas'

export interface TesthubSchema {
  _id: TesthubId
  _creatorId: UserId
  created: string
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
  created: {
    type: RDBType.DATE_TIME
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
