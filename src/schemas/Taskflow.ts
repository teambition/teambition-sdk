import { SchemaDef, RDBType, Relationship } from '../db'
import { schemaColl } from './schemas'
import { TaskflowId, UserId, ProjectId, OrganizationId } from 'teambition-types'
import { TaskflowStatusSnippet } from './TaskflowStatus'

export interface TaskflowSchema {
  _id: TaskflowId
  _boundToObjectId: ProjectId | OrganizationId
  _creatorId: UserId
  boundToObjectType: 'project' | 'organization'
  created: string
  name: string
  objectType: 'task' | 'testcase'
  taskflowstatuses?: TaskflowStatusSnippet[]
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
  objectType: {
    type: RDBType.STRING
  },
  taskflowstatuses: {
    type: Relationship.oneToMany,
    virtual: {
      name: 'TaskflowStatus',
      where: (taskflowStatusTable: any) => ({
        _id: taskflowStatusTable._taskflowId
      })
    }
  },
  updated: {
    type: RDBType.DATE_TIME
  },
}

schemaColl.add({ schema, name: 'Taskflow' })
