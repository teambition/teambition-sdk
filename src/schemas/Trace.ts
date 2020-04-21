import { TraceId, DetailObjectId, DetailObjectType } from 'teambition-types'
import { SchemaDef, RDBType } from '../db'
import { schemaColl } from './schemas'

export interface TraceSchema {
  _boundToObjectId: DetailObjectId
  _id: TraceId
  boundToObjectType: DetailObjectType
  content: string
  status: number
  title: string
}

const schema: SchemaDef<TraceSchema> = {
  _boundToObjectId: {
    type: RDBType.STRING
  },
  _id: {
    type: RDBType.STRING,
    primaryKey: true
  },
  boundToObjectType: {
    type: RDBType.STRING,
  },
  content: {
    type: RDBType.STRING,
  },
  status: {
    type: RDBType.NUMBER,
  },
  title: {
    type: RDBType.STRING,
  },
}

schemaColl.add({ schema, name: 'Trace' })
