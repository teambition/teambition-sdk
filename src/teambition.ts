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
  projectId: ProjectId
  invitorId: string
  signCode: string
}

export interface ExecutorOrCreator {
  name: string
  avatarUrl: string
  _id: IdOfMember
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
  _id: IdOfMember
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
  _creatorId: IdOfMember
  _refId: DetailObjectId
  refType: string
  isFavorite: boolean
  isUpdated: boolean
  isVisible: boolean
  data: any
  created: string
  updated: string
}

export interface UndoFavoriteResponse {
  _refId: DetailObjectId
  refType: DetailObjectType
  isFavorite: boolean
}

export type PostSource = 'shimo' | 'yiqixie' | 'teambition'
export type DetailObjectType = 'task' | 'event' | 'post' | 'work' | 'entry'
export type DetailObjectTypes = 'posts' | 'works' | 'events' | 'tasks' | 'entries'

export interface ActivityId extends String {
  kind: 'ActivityId'
}

export interface ApplicationId extends String {
  kind: 'ApplicationId'
}

export interface CollectionId extends String {
  kind: 'CollectionId'
}

export interface EntryId extends String {
  kind: 'EntryId'
}

export interface EntryCategoryId extends String {
  kind: 'EntryCategoryId'
}

export interface EventId extends String {
  kind: 'EventId'
}

export interface FeedbackId extends String {
  kind: 'FeedbackId'
}

export interface FileId extends String {
  kind: 'FileId'
}

export interface HomeActivityId extends String {
  kind: 'HomeActivityId'
}

export interface IdOfMember extends String {
  kind: 'IdOfMember'
}

export interface MemberId extends String {
  kind: 'MemberId'
}

export interface MessageId extends String {
  kind: 'MessageId'
}

export interface ObjectLinkId extends String {
  kind: 'ObjectLinkId'
}

export interface OrganizationId extends String {
  kind: 'OrganizationId'
}

export interface PreferenceId extends String {
  kind: 'PreferenceId'
}

export interface PostId extends String {
  kind: 'PostId'
}

export interface ProjectId extends String {
  kind: 'ProjectId'
}

export type DefaultRoleId = -1 | 0 | 1 | 2

export interface CustomRoleId extends String {
  kind: 'CustomRoleId'
}

export type RoleId = DefaultRoleId | CustomRoleId

export interface StageId extends String {
  kind: 'StageId'
}

export interface SubscribeId extends String {
  kind: 'SubscribeId'
}

export interface SubtaskId extends String {
  kind: 'SubtaskId'
}

export interface TagId extends String {
  kind: 'TagId'
}

export interface TaskId extends String {
  kind: 'TaskId'
}

export interface TasklistId extends String {
  kind: 'TasklistId'
}

export interface UserId extends String {
  kind: 'UserId'
}

export type DetailObjectId = TaskId | PostId | EventId | FileId

export type DefaultColors = 'gray' | 'red' | 'yellow' | 'green' | 'blue' | 'purple'
