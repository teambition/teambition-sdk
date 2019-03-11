import { SchemaDef, RDBType } from '../db'
import { TaskPrivilegeId, ProjectId, UserId } from 'teambition-types'
import { schemaColl } from './schemas'

export interface TaskPrivilegeSchema {
  _creatorId: UserId
  _id: TaskPrivilegeId
  _projectId: ProjectId
  created: string
  creator: Record<string, boolean>
  executor: Record<string, boolean>
  isEnabled: boolean
  updated: string
}

const schema: SchemaDef<TaskPrivilegeSchema> = {
  _creatorId: {
    type: RDBType.STRING
  },
  _id: {
    type: RDBType.STRING,
    primaryKey: true
  },
  _projectId: {
    type: RDBType.STRING
  },
  created: {
    type: RDBType.DATE_TIME
  },
  creator: {
    type: RDBType.OBJECT
  },
  executor: {
    type: RDBType.OBJECT
  },
  isEnabled: {
    type: RDBType.BOOLEAN
  },
  updated: {
    type: RDBType.DATE_TIME
  }
}

schemaColl.add({ schema, name: 'TaskPrivilege' })
