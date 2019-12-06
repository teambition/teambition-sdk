import { SchemaDef, RDBType } from '../db'
import { schemaColl } from './schemas'
import { AssignmentLinkId, ProjectId, AssignmentType, UserId, UserSnippet } from 'teambition-types'
import { ProjectSchema } from './Project'

export interface AssignmentLinkSchema {
  _id: AssignmentLinkId
  _projectId: ProjectId
  _assignedProjectId: string
  _executorId: UserId | null
  _creatorId: UserId
  created: string
  updated: string
  name: string
  assignmentType: AssignmentType
  project: Pick<ProjectSchema, 'logo' | '_id' | 'name'>
  executor: UserSnippet | null
  assignedProject: {
    logo: string
    _id: string
    name: string
  }
}

const schema: SchemaDef<AssignmentLinkSchema> = {
  _id: {
    type: RDBType.STRING,
    primaryKey: true
  },
  _projectId: {
    type: RDBType.STRING
  },
  _assignedProjectId: {
    type: RDBType.STRING
  },
  _executorId: {
    type: RDBType.STRING
  },
  _creatorId: {
    type: RDBType.STRING
  },
  created: {
    type: RDBType.DATE_TIME
  },
  updated: {
    type: RDBType.DATE_TIME
  },
  name: {
    type: RDBType.STRING
  },
  assignmentType: {
    type: RDBType.STRING
  },
  project: {
    type: RDBType.OBJECT
  },
  executor: {
    type: RDBType.OBJECT
  },
  assignedProject: {
    type: RDBType.OBJECT
  }
}

schemaColl.add({ name: 'AssignmentLink', schema })
