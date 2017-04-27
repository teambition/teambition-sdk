import { SchemaDef, RDBType } from 'reactivedb/interface'
import { schemas } from '../SDK'
import { DefaultRoleId } from 'teambition-types'

export type DefaultRoleName = 'guest' | 'member' | 'admin' | 'owner'

export interface DefaultRoleSchema {
  _id: DefaultRoleId
  name: DefaultRoleName
  permissions: string []
}

const schema: SchemaDef<DefaultRoleSchema> = {
  _id: {
    type: RDBType.STRING,
    primaryKey: true
  },
  name: {
    type: RDBType.STRING
  },
  permissions: {
    type: RDBType.LITERAL_ARRAY
  }
}

schemas.push({ schema, name: 'DefaultRole' })
