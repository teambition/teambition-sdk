import { SchemaDef, RDBType } from 'reactivedb/interface'
import { schemaColl } from './schemas'
import { TaskflowId, UserId } from 'teambition-types'

export interface TaskflowSchema {
  _id: TaskflowId
  name: string
  _boundToObjectId: string
  boundToObjectType: 'project' | 'organization'
  _creatorId: UserId
  created: string
  updated: string
}

const schema: SchemaDef<TaskflowSchema> = {
  _id: {
    type: RDBType.STRING,
    primaryKey: true
  },
  _boundToObjectId: {
    type: RDBType.STRING
  },
  _creatorId: {
    type: RDBType.STRING
  },
  boundToObjectType: {
    type: RDBType.STRING
  },
  created: {
    type: RDBType.DATE_TIME
  },
  name: {
    type: RDBType.STRING
  },
  updated: {
    type: RDBType.DATE_TIME
  }
}

schemaColl.add({ schema, name: 'Taskflow' })
