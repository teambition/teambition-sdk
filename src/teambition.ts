export type visibility = 'project' | 'organization' | 'all' | 'members'

export interface LikeSchema {
  isLike: boolean
  likesCount: number
  likesGroup: ExecutorOrCreator[]
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
  creator: ExecutorOrCreator
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
  creator: ExecutorOrCreator
  title: string
  likes: LikeSchema[]
  isLike: boolean
}

export interface ExecutorOrCreator {
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

export interface ReportSummarySchema {
  accomplishedDelayTasksCount: number
  accomplishedOntimeTasksCount: number
  accomplishedWeekSubTaskCount: number
  accomplishedWeekTaskCount: number
  inprogressDelayTasksCount: number
  inprogressOntimeTasksCount: number
  inprogressSubTasksCount: number
  notStartedTasksCount: number
  totalTasksCount: number
  unassignedTasksCount: number
}

export interface ReportAnalysisSchema {
  values: {
    unfinishedTaskCount: number
    // 2016-08-22 这种格式
    date: string
    _projectId: string
  }
}
