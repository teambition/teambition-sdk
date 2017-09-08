import { RDBType } from 'reactivedb/interface'
import { SchemaDef } from 'reactivedb/interface'
import { TagId, UserId, ProjectId, DefaultColors } from 'teambition-types'
import { schemas } from '../SDK'

export interface TagSchema {
  _creatorId: UserId
  _id: TagId
  _projectId: ProjectId
  color: DefaultColors
  created: string
  isArchived: boolean
  name: string
  updated: string
  postsCount?: number
  tasksCount?: number
  eventsCount?: number
  worksCount?: number
}

const schema: SchemaDef<TagSchema> = {
  _id: {
    type: RDBType.STRING,
    primaryKey: true,
  },
  _creatorId: {
    type: RDBType.STRING,
  },
  _projectId: {
    type: RDBType.STRING,
  },
  color: {
    type: RDBType.STRING,
  },
  created: {
    type: RDBType.DATE_TIME,
  },
  updated: {
    type: RDBType.DATE_TIME,
  },
  isArchived: {
    type: RDBType.BOOLEAN,
  },
  name: {
    type: RDBType.STRING,
  },
  postsCount: {
    type: RDBType.NUMBER
  },
  tasksCount: {
    type: RDBType.NUMBER
  },
  eventsCount: {
    type: RDBType.NUMBER
  },
  worksCount: {
    type: RDBType.NUMBER
  },
}

schemas.push({ name: 'Tag', schema })
