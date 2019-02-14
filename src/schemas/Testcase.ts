import { RDBType, Relationship, SchemaDef } from '../db'
import {
  ProjectId, ScenarioFieldConfigId, CustomFieldValue, ExecutorOrCreator, TestplanId, CommonGroupId,
  TestcaseId, TestcaseType, TestcaseStepType, TestcasePriority, UserId, TaskflowStatusId, OrganizationId
} from 'teambition-types'
import { schemaColl } from './schemas'
import { ProjectSchema } from './Project'
import { TestplanSchema } from './Testplan'
import { CommonGroupSchema } from './CommonGroup'
import { TesthubSchema } from './Testhub'

export interface TestcaseSchema {
  _id: TestcaseId
  _commongroupId: CommonGroupId
  _fromHubTestcaseId: TestcaseId | null
  _creatorId: UserId
  _executorId: UserId | null
  _flowstatusId: TaskflowStatusId
  _projectId: ProjectId
  _organizationId: OrganizationId
  _testhubId: CommonGroupId
  _testplanId: TestplanId
  _scenariofieldconfigId: ScenarioFieldConfigId
  accomplished: string
  caseType: TestcaseType
  customfields: CustomFieldValue[]
  executor: ExecutorOrCreator | null
  involveMembers: UserId[]
  involvers: ExecutorOrCreator[]
  isArchived: boolean
  isDeleted: boolean
  isDone: boolean
  objectType: 'testcase'
  pos?: number // 暂时只服务于测试计划，等待用例库完成去掉 optional
  precondition: string
  priority: TestcasePriority
  steps: TestcaseStepType[]
  title: string
  created: string
  updated: string
  versionUpdated: string
  syncDate: string | null
  project: ProjectSchema | null
  testplan: TestplanSchema | null
  commongroup: CommonGroupSchema | null
  testhub: TesthubSchema | null
}

const schema: SchemaDef<TestcaseSchema> = {
  _commongroupId: {
    type: RDBType.STRING
  },
  _creatorId: {
    type: RDBType.STRING
  },
  _executorId: {
    type: RDBType.STRING
  },
  _fromHubTestcaseId: {
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
  _organizationId: {
    type: RDBType.STRING
  },
  _scenariofieldconfigId: {
    type: RDBType.STRING
  },
  _testhubId: {
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
  commongroup: {
    type: Relationship.oneToOne,
    virtual: {
      name: 'CommonGroup',
      where: (commongroupTable: any) => ({
        _commongroupId: commongroupTable._id
      })
    }
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
  objectType: {
    type: RDBType.STRING
  },
  pos: {
    type: RDBType.NUMBER
  },
  priority: {
    type: RDBType.NUMBER
  },
  precondition: {
    type: RDBType.STRING
  },
  project: {
    type: Relationship.oneToOne,
    virtual: {
      name: 'Project',
      where: (projectTable: any) => ({
        _projectId: projectTable._id
      })
    }
  },
  steps: {
    type: RDBType.OBJECT
  },
  syncDate: {
    type: RDBType.DATE_TIME
  },
  testhub: {
    type: Relationship.oneToOne,
    virtual: {
      name: 'Testhub',
      where: (testhubTable: any) => ({
        _testhubId: testhubTable._id
      })
    }
  },
  testplan: {
    type: Relationship.oneToOne,
    virtual: {
      name: 'Testplan',
      where: (testplanTable: any) => ({
        _testplanId: testplanTable._id
      })
    }
  },
  title: {
    type: RDBType.STRING
  },
  updated: {
    type: RDBType.DATE_TIME
  },
  versionUpdated: {
    type: RDBType.DATE_TIME
  },
}

schemaColl.add({ name: 'Testcase', schema })
