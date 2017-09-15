import { RDBType, SchemaDef, Relationship } from 'reactivedb/interface'
import { CustomFieldValue, ExecutorOrCreator } from 'teambition-types'
import { ProjectId, UserId, OrganizationId, RoleId, CollectionId, ApplicationId } from 'teambition-types'
import { schemas } from '../SDK'

export interface ProjectSchema {
  _creatorId: UserId
  _defaultCollectionId: CollectionId
  _defaultRoleId: RoleId | null
  _id: ProjectId
  _orgRoleId: RoleId | null
  _organizationId: OrganizationId | null
  _parendId: ProjectId
  _roleId: RoleId | null
  _rootCollectionId: CollectionId
  applications?: {
    _id: ApplicationId
    name: string
    type?: number
    order?: number
  }[]
  category: string
  cover: string
  created: string
  creator: ExecutorOrCreator
  customfields: CustomFieldValue[],
  description: string
  eventsCount: number
  hasOrgRight: number
  hasRight: number
  inviteLink: string | null
  isArchived: boolean
  isDeleted: boolean
  isPublic: boolean
  isStar: boolean
  logo: string
  membersCount: number
  name: string
  organization: {
    _id: OrganizationId
    description: string
    isExpired: boolean
    isPublic: boolean
    logo: string
    name: string
    plan: {
      days: number
      expired: string
      membersCount: number
      objectType: string
      paidCount: number
      status: string
    }
  }
  pinyin: string
  postsCount: number
  pushStatus: boolean
  py: string
  shortLink?: string
  sortMethod: 'duedate' | 'priority' | 'created_asc' | 'created_desc' | 'startdate' | 'custom'
  starsCount: number
  syncCountsAt: string //  a Date
  tagsCount: number
  tasksCount: number
  uniqueIdPrefix: string
  unreadCount: number
  updated: string
  visibility: 'project' | 'organization' | 'all'
  worksCount: number
}

const Schema: SchemaDef<ProjectSchema> = {
  _creatorId: {
    type: RDBType.STRING
  },
  _defaultCollectionId: {
    type: RDBType.STRING
  },
  _defaultRoleId: {
    type: RDBType.STRING
  },
  _id: {
    type: RDBType.STRING,
    primaryKey: true
  },
  _organizationId: {
    type: RDBType.STRING
  },
  _orgRoleId: {
    type: RDBType.STRING
  },
  _parendId: {
    type: RDBType.STRING
  },
  _roleId: {
    type: RDBType.STRING
  },
  _rootCollectionId: {
    type: RDBType.STRING
  },
  // can not join
  applications: {
    type: RDBType.OBJECT
  },
  category: {
    type: RDBType.STRING
  },
  cover: {
    type: RDBType.STRING
  },
  created: {
    type: RDBType.DATE_TIME
  },
  creator: {
    type: Relationship.oneToOne,
    virtual: {
      name: 'User',
      where: (userTable: any) => ({
        _creatorId: userTable._id
      })
    }
  },
  customfields: {
    type: RDBType.OBJECT
  },
  description: {
    type: RDBType.STRING
  },
  eventsCount: {
    type: RDBType.NUMBER
  },
  hasOrgRight: {
    type: RDBType.NUMBER
  },
  hasRight: {
    type: RDBType.NUMBER
  },
  inviteLink: {
    type: RDBType.STRING
  },
  isArchived: {
    type: RDBType.BOOLEAN
  },
  isDeleted: {
    type: RDBType.BOOLEAN
  },
  isPublic: {
    type: RDBType.BOOLEAN
  },
  isStar: {
    type: RDBType.BOOLEAN
  },
  logo: {
    type: RDBType.STRING
  },
  membersCount: {
    type: RDBType.NUMBER
  },
  name: {
    type: RDBType.STRING
  },
  organization: {
    type: Relationship.oneToOne,
    virtual: {
      name: 'Organization',
      where: (organizationTable: any) => ({
        _organizationId: organizationTable._id
      })
    }
  },
  pinyin: {
    type: RDBType.STRING
  },
  postsCount: {
    type: RDBType.NUMBER
  },
  pushStatus: {
    type: RDBType.BOOLEAN
  },
  py: {
    type: RDBType.STRING
  },
  shortLink: {
    type: RDBType.STRING
  },
  sortMethod: {
    type: RDBType.STRING
  },
  starsCount: {
    type: RDBType.NUMBER
  },
  syncCountsAt: {
    type: RDBType.DATE_TIME
  },
  tagsCount: {
    type: RDBType.NUMBER
  },
  tasksCount: {
    type: RDBType.NUMBER
  },
  uniqueIdPrefix: {
    type: RDBType.STRING
  },
  unreadCount: {
    type: RDBType.NUMBER
  },
  updated: {
    type: RDBType.DATE_TIME
  },
  visibility: {
    type: RDBType.STRING
  },
  worksCount: {
    type: RDBType.NUMBER
  }
}

schemas.push({ name: 'Project', schema: Schema })
