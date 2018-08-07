import { RDBType, SchemaDef } from 'reactivedb/interface'
import { TestplanId, ProjectId, UserId } from 'teambition-types'
import { schemaColl } from './schemas'

export interface TestplanSchema {
  _id: TestplanId
  _creatorId: UserId
  _projectId: ProjectId
  name: string
  startDate: string | null
  dueDate: string | null
  isDeleted: boolean
  created: string
  updated: string
}

const schema: SchemaDef<TestplanSchema> = {
  _creatorId: {
    type: RDBType.STRING
  },
  _id: {
    type: RDBType.STRING,
    primaryKey: true,
  },
  _projectId: {
    type: RDBType.STRING
  },
  created: {
    type: RDBType.DATE_TIME
  },
  dueDate: {
    type: RDBType.DATE_TIME
  },
  isDeleted: {
    type: RDBType.BOOLEAN
  },
  name: {
    type: RDBType.STRING
  },
  startDate: {
    type: RDBType.DATE_TIME
  },
  updated: {
    type: RDBType.DATE_TIME
  }
}

schemaColl.add({ name: 'Testplan', schema })
