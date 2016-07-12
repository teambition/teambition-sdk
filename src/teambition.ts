export interface LinkedSchema {
  _id: string
  _projectId: string
  _parentId: string
  _linkedId: string
  _creatorId: string
  updated: string
  created: string
  linkedType: string
  parentType: string
  creator: Executor
  title: string
  project: string
  isDone: boolean
  icon?: string
}

export type visibility = 'project' | 'organization' | 'all'

export interface LikeSchema {
  isLike: boolean
  likesCount: number
  likesGroup: Executor[]
}

export interface TagsData {
  _creatorId: string
  _id: string
  _projectId: string
  color: string
  created: string
  isArchived: boolean
  name: string
  updated: string
}

export interface TburlSchema {
  statusCode: number
  isExist: boolean
  code: string
  origin?: string
}

export interface ProjectInviteSchema {
  projectId: string
  invitorId: string
  signCode: string
}

export interface ProjectActivitiesSchema {
  _id: string
  action: string
  content: {
    objects: any
    objectType: string
    creator: string
  }
  created: string
  boundToObjectType: string
  creator: Executor
  title: string
  creatorId?: string
  creatorName?: string
  avatarUrl?: string
  icon?: string
  files?: any[]
  type?: string
  postTitle?: string
  objectHref?: string
  isDone?: boolean
  objectContent?: string
}

export interface HomeActivitySchema {
  _id: string
  _creatorId: string
  action: string
  content: {
    objects: any[],
    objectType: 'post' | 'task' | 'event' | 'work',
    creator: string
  },
  rootId: string,
  created: string
  _boundToObjectId: string,
  boundToObjectType: 'post' | 'task' | 'event' | 'work'
  rawAction: string
  creator: Executor
  title: string
  likes: LikeSchema[]
  isLike: boolean
}

export interface Executor {
  name: string
  avatarUrl: string
  _id: string
}

export interface InviteLinkSchema {
  inviteLink: string
  mobileInviteLink: string
  signCode: string
  created: string
  expiration: string
}

export interface CreatedInProjectSchema {
  work: number
  post: number
  event: number
  task: number
}

export interface RecommendMemberSchema {
  _id: string
  email: string
  avatarUrl: string
  name: string
  latestActived: string
  isActive: boolean
  website: string
  title: string
  location: string
}

export interface ProjectStatisticSchema {
  task: {
    total: number
    done: number
    today: number
  }
  recent: number[]
  days: number[][]
}
