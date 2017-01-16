import { ApplicationId } from 'teambition-types'
import { RDBType, SchemaDef } from 'reactivedb'
import { schemas } from '../SDK'

export interface ApplicationData {
  _id: ApplicationId
  name: string
  updated: string
  created: string
  status: string
  description: {
    zh: string
    en: string
  }
  title: {
    zh: string
    en: string
  }
  type: number
}

const Schema: SchemaDef<ApplicationData> = {
  _id: {
    type: RDBType.STRING,
    primaryKey: true
  },
  created: {
    type: RDBType.DATE_TIME
  },
  description: {
    type: RDBType.OBJECT
  },
  name: {
    type: RDBType.STRING
  },
  status: {
    type: RDBType.STRING
  },
  title: {
    type: RDBType.OBJECT
  },
  type: {
    type: RDBType.STRING
  },
  updated: {
    type: RDBType.DATE_TIME
  }
}

schemas.push({ name: 'Application', schema: Schema })
