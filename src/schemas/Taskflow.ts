import { SchemaDef, RDBType, Relationship } from '../db'
import { schemaColl } from './schemas'
import {
  TaskflowId, UserId, ProjectId, OrganizationId, CustomFieldRelevantSetting
} from 'teambition-types'
import { TaskflowStatusSnippet } from './TaskflowStatus'

export interface TaskflowSchema {
  _id: TaskflowId
  _boundToObjectId: ProjectId | OrganizationId
  _creatorId: UserId
  boundToObjectType: 'project' | 'organization'
  created: string
  name: string
  payload: any
  objectType: 'task' | 'testcase'
  setting?: CustomFieldRelevantSetting
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
  payload: {
    type: RDBType.OBJECT
  },
  objectType: {
    type: RDBType.STRING
  },
  setting: {
    type: RDBType.OBJECT
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
