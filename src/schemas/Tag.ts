import { RDBType } from 'reactivedb/interface'
import { SchemaDef } from 'reactivedb/interface'
import { TagId, UserId, ProjectId, DefaultColors, OrganizationId, TagCategoryId } from 'teambition-types'
import { schemaColl } from './schemas'

export interface TagCategorySchema {
  _id: TagCategoryId
  _creatorId: UserId
  _organizationId: OrganizationId
  name: string
  created: string
  updated: string
  isDefault?: boolean
}

export interface TagSchema {
  _creatorId: UserId
  _id: TagId
  _projectId: ProjectId
  _organizationId: OrganizationId
  color: DefaultColors
  created: string
  isArchived: boolean
  name: string
  updated: string
  postsCount?: number
  tasksCount?: number
  eventsCount?: number
  worksCount?: number
  tagcategoryIds?: TagCategoryId[]
  tagcategories?: TagCategorySchema[]
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
  _organizationId: {
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
  tagcategoryIds: {
    type: RDBType.LITERAL_ARRAY
  },
  tagcategories: {
    type: RDBType.OBJECT
  },
}

schemaColl.add({ name: 'Tag', schema })
