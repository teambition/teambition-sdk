import { RDBType, Relationship, SchemaDef } from 'reactivedb/interface'
import {
  ProjectId, ScenarioFieldConfigId, CustomFieldValue, ExecutorOrCreator, TestplanId,
  TestcaseId, TestcaseflowStatusId, TestcaseType, UserId } from 'teambition-types'
import { schemaColl } from './schemas'

export interface TestcaseSchema {
  _id: TestcaseId
  _creatorId: UserId
  _executorId: UserId
  _flowstatusId: TestcaseflowStatusId
  _projectId: ProjectId
  _testplanId: TestplanId
  _scenariofieldconfigId: ScenarioFieldConfigId
  accomplished: string
  caseType: TestcaseType
  customfields: CustomFieldValue[]
  executor: ExecutorOrCreator
  involveMembers: UserId[]
  involvers: ExecutorOrCreator[]
  isArchived: boolean
  isDeleted: boolean
  isDone: boolean
  precondition: string
  priority: number
  steps: string
  title: string
  created: string
  updated: string
}

const schema: SchemaDef<TestcaseSchema> = {
  _creatorId: {
    type: RDBType.STRING
  },
  _executorId: {
    type: RDBType.STRING
  },
  _id: {
    type: RDBType.STRING,
    primaryKey: true
  },
  _flowstatusId: {
    type: RDBType.STRING
  },
  _projectId: {
    type: RDBType.STRING
  },
  _scenariofieldconfigId: {
    type: RDBType.STRING
  },
  _testplanId: {
    type: RDBType.STRING
  },
  accomplished: {
    type: RDBType.DATE_TIME
  },
  caseType: {
    type: RDBType.STRING
  },
  created: {
    type: RDBType.DATE_TIME
  },
  customfields: {
    type: RDBType.OBJECT
  },
  executor: {
    type: Relationship.oneToOne,
    virtual: {
      name: 'User',
      where: (userTable: any) => ({
        _executorId: userTable._id
      })
    }
  },
  involveMembers: {
    type: RDBType.LITERAL_ARRAY
  },
  involvers: {
    type: RDBType.OBJECT
  },
  isArchived: {
    type: RDBType.BOOLEAN
  },
  isDeleted: {
    type: RDBType.BOOLEAN
  },
  isDone: {
    type: RDBType.BOOLEAN
  },
  priority: {
    type: RDBType.NUMBER
  },
  precondition: {
    type: RDBType.STRING
  },
  steps: {
    type: RDBType.STRING
  },
  title: {
    type: RDBType.STRING
  },
  updated: {
    type: RDBType.DATE_TIME
  }
}

schemaColl.add({ name: 'Testcase', schema })
