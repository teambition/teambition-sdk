import { SchemaDef, RDBType } from 'reactivedb/interface'
import { schemaColl } from './schemas'
import { TaskflowId, TestcaseflowStatusId, UserId } from 'teambition-types'

export type TestcaseflowStatusSnippet = {
  _id: TestcaseflowStatusId
  _taskflowId: TaskflowId
  kind: 'start' | 'unset' | 'end'
  name: string
  pos: number
  rejectStatusIds: TestcaseflowStatusId[]
}

export interface TestcaseflowStatusSchema extends TestcaseflowStatusSnippet {
  _creatorId: UserId
  created: string
  updated: string
}

const schema: SchemaDef<TestcaseflowStatusSchema> = {
  _id: {
    type: RDBType.STRING,
    primaryKey: true
  },
  _creatorId: {
    type: RDBType.STRING
  },
  _taskflowId: {
    type: RDBType.STRING
  },
  created: {
    type: RDBType.DATE_TIME
  },
  kind: {
    type: RDBType.STRING
  },
  name: {
    type: RDBType.STRING
  },
  pos: {
    type: RDBType.NUMBER
  },
  rejectStatusIds: {
    type: RDBType.OBJECT
  },
  updated: {
    type: RDBType.DATE_TIME
  }
}

schemaColl.add({ schema, name: 'TestcaseflowStatus' })
