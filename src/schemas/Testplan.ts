import { RDBType, SchemaDef } from '../db'
import { ProjectId, TesthubId, TestplanId, UserId } from 'teambition-types'
import { schemaColl } from './schemas'

export type TestplanCasesCount = {
  defaultGroupCase: number
  total: number
  undone: number
}

export interface TestplanSchema {
  _id: TestplanId
  _creatorId: UserId
  _projectId: ProjectId
  name: string
  startDate: string | null
  dueDate: string | null
  isDeleted: boolean
  created: string
  testcaseCount: TestplanCasesCount
  testhubIds: TesthubId[]
  updated: string
  isSuspended: boolean
  suspendedByUserId: UserId
  suspendedDate: string
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
  testcaseCount: {
    type: RDBType.OBJECT
  },
  testhubIds: {
    type: RDBType.LITERAL_ARRAY
  },
  updated: {
    type: RDBType.DATE_TIME
  },
  isSuspended: {
    type: RDBType.BOOLEAN
  },
  suspendedByUserId: {
    type: RDBType.STRING
  },
  suspendedDate: {
    type: RDBType.STRING
  }
}

schemaColl.add({ name: 'Testplan', schema })
