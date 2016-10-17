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
  accomplishedTasksCount: number
  accomplishedWeekTasksCount: number
  accomplishedOntimeWeekTasksCount: number
  accomplishedWeekSubTasksCount: number
  accomplishedOntimeWeekSubTasksCount: number
  accomplishedSubTasksCount: number
  accomplishedOntimeSubTasksCount: number
}

export interface ReportAnalysisSchema {
  values: {
    unfinishedTaskCount: number
    // 2016-08-22 这种格式
    date: string
  }[]
}

export interface FavoriteResponse {
  _id: string
  _creatorId: string
  _refId: string
  refType: string
  isFavorite: boolean
  isUpdated: boolean
  isVisible: boolean
  data: any
  created: string
  updated: string
}

export interface UndoFavoriteResponse {
  _refId: string
  refType: string
  isFavorite: boolean
}

export type PostSource = 'shimo' | 'yiqixie' | 'teambition'
