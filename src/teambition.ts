// id

declare module 'teambition-types' {
  export interface ActivenessId extends String { kind?: 'ActivenessId' }
  export interface ActivityId extends String { kind?: 'ActivityId' }
  export interface ApplicationId extends String { kind?: 'ApplicationId' }
  export interface CollectionId extends String { kind?: 'CollectionId' }
  export interface CustomFieldChoiceId extends String { kind?: 'CustomFieldChoiceId' }
  export interface CustomFieldId extends String { kind?: 'CustomFieldId' }
  export interface CustomFieldLinkId extends String { kind?: 'CustomFieldLinkId' }
  export interface CustomFieldValueId extends String { kind?: 'CustomFieldValueId' }
  export interface CustomRoleId extends String { kind?: 'CustomRoleId' }
  export interface EntryCategoryId extends String { kind?: 'EntryCategoryId' }
  export interface EntryId extends String { kind?: 'EntryId' }
  export interface EventId extends String { kind?: 'EventId' }
  export interface FeedbackId extends String { kind?: 'FeedbackId' }
  export interface FileId extends String { kind?: 'FileId' }
  export interface GroupId extends String { kind?: 'GroupId' }
  export interface HomeActivityId extends String { kind?: 'HomeActivityId' }
  export interface MemberId extends String { kind?: 'MemberId' }
  export interface MessageId extends String { kind?: 'MessageId' }
  export interface ObjectLinkId extends String { kind?: 'ObjectLinkId' }
  export interface OrganizationId extends String { kind?: 'OrganizationId' }
  export interface PostId extends String { kind?: 'PostId' }
  export interface PreferenceId extends String { kind?: 'PreferenceId' }
  export interface ProjectBoardId extends String { kind?: 'ProjectBoardId' }
  export interface ProjectId extends String { kind?: 'ProjectId' }
  export interface ProjectTagId extends String { kind?: 'ProjectTagId' }
  export interface RoomId extends String { kind?: 'RoomId' }
  export interface ScenarioFieldId extends String { kind?: 'ScenarioFieldId' }
  export interface ScenarioFieldConfigId extends String { kind?: 'ScenarioFieldConfigId' }
  export interface StageId extends String { kind?: 'StageId' }
  export interface SubscribeId extends String { kind?: 'SubscribeId' }
  export interface SubtaskId extends String { kind?: 'SubtaskId' }
  export interface TagId extends String { kind?: 'TagId' }
  export interface TapChartId extends String { kind?: 'TapChartId' }
  export interface TapDashboardId extends String { kind?: 'TapDashboardId' }
  export interface TaskId extends String { kind?: 'TaskId' }
  export interface TasklistId extends String { kind?: 'TasklistId' }
  export interface TeamId extends String { kind?: 'TeamId' }
  export interface UserId extends String { kind?: 'UserId' }
  export interface VersionId extends String { kind?: 'VersionId' }
  export interface WorkId extends String { kind?: 'WorkId' }
}

// computed id

declare module 'teambition-types' {
  export type DefaultRoleId = -1 | 0 | 1 | 2
  export type DetailObjectId = TaskId | PostId | EventId | FileId
  export type RoleId = DefaultRoleId | CustomRoleId
}

// types

declare module 'teambition-types' {
  export type CustomFieldBoundType = 'member' | 'project' | 'application'
  export type CustomFieldType = 'date' | 'dropDown' | 'multipleChoice' | 'number' | 'text'
  export type CustomScenarioFieldType = 'customfield'
  export type DefaultColors = 'gray' | 'red' | 'yellow' | 'green' | 'blue' | 'purple'
  export type DetailObjectType = 'entry' | 'event' | 'post' | 'task' | 'work'
  export type DetailObjectTypes = 'entries' | 'events' | 'posts' | 'tasks' | 'works'
  export type EventOfficialScenarioFieldType = 'content' | 'location' | 'tag'
  export type EventScenarioFieldIcon = 'event' | 'lecture' | 'training' | 'workshop' | 'forum' | 'seminar' | 'personal'
  export type ReminderType = 'customize' | 'dueDate' | 'startDate' | 'unset'
  export type ScenarioFieldConfigIcon = TaskScenarioFieldIcon | EventScenarioFieldIcon
  export type ScenarioFieldConfigObjectType = 'task' | 'event'
  export type ScenarioFieldType = CustomScenarioFieldType | TaskOfficialScenarioFieldType | EventOfficialScenarioFieldType
  export type TaskOfficialScenarioFieldType = 'note' | 'priority' | 'tag' | 'worktimes' | 'storyPoint' | 'taskProgress' | 'rating'
  export type TaskPriority = 0 | 1 | 2
  export type TaskScenarioFieldIcon = 'task' | 'requirement' | 'bug' | 'hr' | 'resource' | 'order' | 'salesLead'
  export type TeamMemberStatus = 'in' | 'quited' | 'disabled'
  export type Visibility = 'all' | 'members' | 'organization' | 'project'
}

declare module 'teambition-types' {

  export interface CustomFieldValue {
    _customfieldId: CustomFieldId
    type: CustomFieldType
    values: string[]
  }

  export interface Reminder {
    date: string
    members: UserId[]
    type: ReminderType
    _creatorId: UserId
  }

  export interface LikeSchema {
    isLike: boolean
    likesCount: number
    likesGroup: ExecutorOrCreator[]
  }

  export interface TbUrlSchema {
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
    _id: UserId
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
    _id: UserId
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
    _creatorId: UserId
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

  export interface TasksMeCount {
    executedTasksDoneCount: number
    executedTasksUndoneCount: number
    createdTasksDoneCount: number
    createdTasksUndoneCount: number
    involvedTasksDoneCount: number
    involvedTasksUndoneCount: number
    createdSubtasksDoneCount: number
    createdSubtasksUndoneCount: number
    executedSubtasksDoneCount: number
    executedSubtasksUndoneCount: number
  }

  export type TapBaseRefType = keyof TapGenericFilterRequest

  export type TapBaseDataType = 'type/MongoId' | 'type/Date' | 'type/Number' | 'type/String' | 'type/Boolean'

  export type TapFilterTarget<R extends TapBaseRefType, D extends TapBaseDataType, U> = {
    refType: R
    isRequired: boolean
    dataType: D
    refData?: U
    defaultValue?: U
  }

  export interface TapGenericFilterRequest {
    projectId?: ProjectId[]
    executorId?: UserId[]
    executorGroup?: TeamId[]
    stageId?: StageId[]
    organizationId?: OrganizationId[]
    creatorId?: UserId[]
    creatorGroup?: TeamId[]
    tasklistId?: TasklistId[]
    createBegin?: string
    createEnd?: string
    createRelative?: string
    dueBegin?: string
    dueEnd?: string
    dueRelative?: string
    accBegin?: string
    accEnd?: string
    accRelative?: string
    startBegin?: string
    startEnd?: string
    startRelative?: string
    rangeBegin?: string
    rangeEnd?: string
    rangeRelative?: string
    isDone?: boolean
    isArchived?: boolean
    priority?: number
    isOverdue?: boolean
    limit?: number
    isSubtask?: boolean
    pageCount?: number
    pageNum?: number
  }

  export type TapGenericFilterResponse = Array<
    TapFilterTarget<'projectId', 'type/MongoId', ProjectId[]> |
    TapFilterTarget<'executorId', 'type/MongoId', UserId[]> |
    TapFilterTarget<'executorGroup', 'type/MongoId', TeamId[]> |
    TapFilterTarget<'stageId', 'type/MongoId', StageId[]> |
    TapFilterTarget<'organizationId', 'type/MongoId', OrganizationId[]> |
    TapFilterTarget<'creatorId', 'type/MongoId', UserId[]> |
    TapFilterTarget<'creatorGroup', 'type/MongoId', TeamId[]> |
    TapFilterTarget<'tasklistId', 'type/MongoId', TasklistId[]> |
    TapFilterTarget<'createBegin', 'type/Date', string> |
    TapFilterTarget<'createEnd', 'type/Date', string> |
    TapFilterTarget<'createRelative', 'type/String', string> |
    TapFilterTarget<'dueBegin', 'type/Date', string> |
    TapFilterTarget<'dueEnd', 'type/Date', string> |
    TapFilterTarget<'dueRelative', 'type/String', string> |
    TapFilterTarget<'accBegin', 'type/Date', string> |
    TapFilterTarget<'accEnd', 'type/Date', string> |
    TapFilterTarget<'accRelative', 'type/String', string> |
    TapFilterTarget<'startBegin', 'type/Date', string> |
    TapFilterTarget<'startEnd', 'type/Date', string> |
    TapFilterTarget<'startRelative', 'type/String', string> |
    TapFilterTarget<'rangeBegin', 'type/Date', string> |
    TapFilterTarget<'rangeEnd', 'type/Date', string> |
    TapFilterTarget<'rangeRelative', 'type/String', string> |
    TapFilterTarget<'isDone', 'type/Boolean', boolean> |
    TapFilterTarget<'isArchived', 'type/Boolean', boolean> |
    TapFilterTarget<'priority', 'type/Number', number> |
    TapFilterTarget<'isOverdue', 'type/Boolean', boolean> |
    TapFilterTarget<'limit', 'type/Number', number> |
    TapFilterTarget<'isSubtask', 'type/Boolean', boolean> |
    TapFilterTarget<'pageCount', 'type/Number', number> |
    TapFilterTarget<'pageNum', 'type/Number', number>
  >
}
