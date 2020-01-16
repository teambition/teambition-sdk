// abstract

declare module 'teambition-types' {
  /**
   * 可以用于获取 schema 类型上一些对象类型字段的键名，如：
   * 用 `NestedKeys<TaskSchema, 'executor'>` 匹配
   * `[ '_id', 'name', 'avatarUrl' ]` 这样的数组值。对于 optional
   * 或者可能为 `null` 的字段，如 TaskSchema 上的 `executor`，
   * 会排除 optional 或 `null` 的影响，给出当有值时该对象应该
   * 有的字段。
   */
  export type NestedKeys<T, K extends keyof T> = Array<keyof NonNullable<Required<T>[K]>>
}

// id

declare module 'teambition-types' {
  export type ActivenessId = string & { kind: 'ActivenessId' }
  export type ActivityId = string & { kind: 'ActivityId' }
  export type AdvancedCustomFieldId = string & { kind: 'AdvancedCustomFieldId' }
  export type ApplicationId = string & { kind: 'ApplicationId' }
  export type CollectionId = string & { kind: 'CollectionId' }
  export type CommonGroupId = string & { kind: 'CommonGroupId' }
  export type CustomFieldCategoryId = string & { kind: 'CustomFieldCategoryId' }
  export type CustomFieldChoiceId = string & { kind: 'CustomFieldChoiceId' }
  export type CustomFieldEntityId = string & { kind: 'CustomFieldEntityId' }
  export type CustomFieldId = string & { kind: 'CustomFieldId' }
  export type CustomFieldLinkId = string & { kind: 'CustomFieldLinkId' }
  export type CustomFieldValueId = string & { kind: 'CustomFieldValueId' }
  export type CustomRoleId = string & { kind: 'CustomRoleId' }
  export type DashboardCardId = string & { kind: 'DashboardCardId' }
  export type EntryCategoryId = string & { kind: 'EntryCategoryId' }
  export type EntryId = string & { kind: 'EntryId' }
  export type EventId = string & { kind: 'EventId' }
  export type FeedbackId = string & { kind: 'FeedbackId' }
  export type FileId = string & { kind: 'FileId' }
  export type GroupId = string & { kind: 'GroupId' }
  export type HomeActivityId = string & { kind: 'HomeActivityId' }
  export type MemberId = string & { kind: 'MemberId' }
  export type MessageId = string & { kind: 'MessageId' }
  export type ObjectLinkId = string & { kind: 'ObjectLinkId' }
  export type OrganizationId = string & { kind: 'OrganizationId' }
  export type PostId = string & { kind: 'PostId' }
  export type PreferenceId = string & { kind: 'PreferenceId' }
  export type ProjectBoardId = string & { kind: 'ProjectBoardId' }
  export type ProjectId = string & { kind: 'ProjectId' }
  export type ProjectPortalMode = 'grid' | 'list' | 'table'
  export type ProjectOrder = 'updated' | 'name' | 'recentVisit'
  export type ProjectStatusActivityId = string & { kind: 'ProjectStatusActivityId' }
  export type ProjectTagId = string & { kind: 'ProjectTagId' }
  export type ProjectTemplateId = string & { kind: 'ProjectTemplateId' }
  export type RoomId = string & { kind: 'RoomId' }
  export type ScenarioFieldConfigId = string & { kind: 'ScenarioFieldConfigId' }
  export type ScenarioFieldId = string & { kind: 'ScenarioFieldId' }
  export type SmartGroupId = string & { kind: 'SmartGroupId' }
  export type SprintId = string & { kind: 'SprintId' }
  export type StageId = string & { kind: 'StageId' }
  export type SubscribeId = string & { kind: 'SubscribeId' }
  export type SubtaskId = string & { kind: 'SubtaskId' }
  export type TagCategoryId = string & { kind: 'TagCategoryId' }
  export type TagId = string & { kind: 'TagId' }
  export type TapChartId = string & { kind: 'TapChartId' }
  export type TapDashboardId = string & { kind: 'TapDashboardId' }
  export type TaskDependencyId = string & { kind: 'TaskDependencyId' }
  export type TaskflowId = string & { kind: 'TaskflowId' }
  export type TaskflowStatusId = string & { kind: 'TaskflowStatusId' }
  export type TaskId = string & { kind: 'TaskId' }
  export type TasklistId = string & { kind: 'TasklistId' }
  export type TaskPrivilegeId = string & { kind: 'TaskPrivilegeId' }
  export type TeamId = string & { kind: 'TeamId' }
  export type TestcaseId = string & { kind: 'TestcaseId' }
  export type TesthubId = string & { kind: 'TesthubId' }
  export type TestplanId = string & { kind: 'TestplanId' }
  export type TestcaseStepId = string & { kind: 'TestcaseStepId' }
  export type UserId = string & { kind: 'UserId' }
  export type VersionId = string & { kind: 'VersionId' }
  export type WorkId = string & { kind: 'WorkId' }
}

// computed id

declare module 'teambition-types' {
  export type DefaultRoleId = -1 | 0 | 1 | 2
  export type DetailObjectId = TaskId | PostId | EventId | FileId | TestcaseId
  export type RoleId = DefaultRoleId | CustomRoleId
}

// types

declare module 'teambition-types' {
  export type Actor = 'executor' | 'creator'
  export type CustomFieldBoundType = 'member' | 'project' | 'application'
  export type CustomFieldType = 'date' | 'dropDown' | 'multipleChoice' | 'number' | 'text' | 'lookup' | 'commongroup' | 'work' | 'cascading'
  export type CustomFieldSubtype = 'story' | 'bug'
  export type CustomRoleType = 'project' | 'organization'
  export type CustomScenarioFieldType = 'customfield'
  export type DefaultColors = 'gray' | 'red' | 'yellow' | 'green' | 'blue' | 'purple' | 'cyan'
  export type DetailObjectType = 'entry' | 'event' | 'post' | 'task' | 'work' | 'testcase'
  export type DetailObjectTypes = 'entries' | 'events' | 'posts' | 'tasks' | 'works' | 'testcases'
  export type DivisionType = TaskDivisionType
  export type EntryStatus = 'confirmed' | 'approved'
  export type EntryType = 1 | -1
  export type EventOfficialScenarioFieldType = 'content' | 'location' | 'tag'
  export type EventScenarioFieldIcon = 'event' | 'lecture' | 'training' | 'workshop' | 'forum' | 'seminar' | 'personal'
  export type JoinProjectRole = 'default' | 'owner'
  export type ProjectStatusDegree = 'normal' | 'risky' | 'urgent'
  export type ProjectTagVisibleOption = 'organization' | 'involves'
  export type ProjectTemplateVisibleOption = 'organization' | 'involves'
  export type ReminderType = 'customize' | 'dueDate' | 'startDate' | 'unset'  // 兼容旧版本，新功能开发请使用 ReminderRuleType
  export type ReminderRuleType = 'startDate' | 'dueDate' | 'customize' | 'beforeStartDate' | 'beforeDueDate' | 'afterStartDate' | 'afterDueDate'
  export type ReminderUnit = 'minute' | 'hour' | 'day'
  export type ScenarioFieldConfigIcon = TaskScenarioFieldIcon | EventScenarioFieldIcon | TestcaseScenarioFieldIcon
  export type ScenarioFieldConfigObjectType = 'task' | 'event' | 'testcase'
  export type ScenarioFieldType =
    | CustomScenarioFieldType
    | TaskOfficialScenarioFieldType
    | EventOfficialScenarioFieldType
    | TestcaseOfficialScenarioFieldType
  export type ScenarioProTemplateConfigType = 'story' | 'bug' | 'subtask' | 'milestone'
  export type SmartGroupPredefinedIcon = 'taskToday' | 'taskUndone' | 'taskDone' | 'taskNotAssigned' | 'taskMyExecuted'
  export type SmartGroupType = 'custom' | 'story' | 'sprint' | 'bug' | 'story.custom' | 'bug.custom' | 'sprint.custom'
  export type SmartGroupViewType = 'table' | 'time' | 'kanban' | 'list'
  export type SmartGroupViewVisibilityType = 'user' | 'project'
  export type SmartGroupViewTaskLayer = 'all' | 'onlyTopLevel' | 'exceptTopLevel'
  export type TaskSortMethod = 'duedate' | 'priority' | 'created_asc' | 'created_desc' | 'startdate' | 'startdate_desc' | 'custom'
    | 'updated_asc' | 'updated_desc'
  export type SwimAxisLane = 'sprint' | 'subtask' | 'executor' | 'stage' | 'priority' | 'isDone'
    | 'taskType' | 'rating' | 'storyPoint'
  export type BoardAxisType = 'iterationSprint' | 'priority' | 'stage' | 'taskflowStatus' | 'taskflow' | 'scenarioConfig' | 'scenarioConfigStatus'
  export type TagType = 'organization' | 'project'
  export type TaskDependencyKind = 'start_start' | 'start_finish' | 'finish_start' | 'finish_finish'
  export type TaskDivisionType = 'scenariofields' | 'subtasks' | 'links'
  export type TaskOfficialScenarioFieldType = 'note' | 'priority' | 'tag' | 'worktimes' | 'storyPoint' | 'taskProgress' | 'rating' | 'sprint'
  export type TaskPriority = 0 | 1 | 2
  export type TaskScenarioFieldIcon = 'task' | 'requirement' | 'bug' | 'hr' | 'resource' | 'order' | 'salesLead' | 'subtask' | 'call' | 'visit'
    | 'forum' | 'milestone'
  export type TeamMemberStatus = 'in' | 'quited' | 'disabled'
  export type TestcaseOfficialScenarioFieldType = 'precondition' | 'priority' | 'steps' | 'caseType'
  export type TestcaseScenarioFieldIcon = 'testcase'
  export type TestcasePriority = -1 | 0 | 1 | 2 | 3 | 4 | 5
  export type TestcaseStepType = {
    _id: TestcaseStepId
    desc: string
    expected: string
  }
  export type TestcaseType = 'function' | 'performance' | 'config' | 'deployment' | 'security' | 'api' | 'other'
  export type UserLevel = -2 | -1 | 0 | 1 | 2
  export type VisibleOption = 'members' | 'involves'
  export type TapChartName =
    // udr start
    | 'custom'
    | 'executordistributiontasks'
    | 'prioritydistributiontasks'
    | 'groupdonetasks'
    | 'donetasks'
    | 'periodcompletetasks'
    | 'executortasks'
    | 'executordonetasks'
    | 'executorduetasks'
    | 'sprintdistributionbugs'
    | 'executordistributionbugs'
    | 'creatordistributionbugs'
    | 'prioritydistributionbugs'
    | 'taskstatusistributionbugs'
    | 'executortaskstatusbugs'
    // udr end & tdr start
    | 'overview_report'
    | 'scrum_sprint_taskflow'
    | 'general_project_burndown'
    | 'general_project_trend'
    | 'worktime_task'
    | 'delivery_cycle'
    | 'scrum_sprint_burndown'
    | 'scrum_sprint_burnup'
    | 'scrum_sprint_analysis'
    | 'scrum_team_speed'
    | 'scrum_bug_age_report'
    | 'scrum_bug_trend'
    | 'scrum_bug_accumulative_trend'
    | 'all_testcase_status_distribution'
    | 'all_testcase_trend'
    // 概览预览支持的 chartName
    | 'total'
    | 'done_detail'
    | 'undone_detail'
    | 'overdue_detail'
    | 'unassigned_detail'
    | 'ontimedone_detail'
    | 'duetoday_detail'
    | 'overduedone_detail'
}

declare module 'teambition-types' {

  export interface AdvancedCustomField {
    _id: AdvancedCustomFieldId
    icon: string
    hasCreateUrl: boolean
    name: string
    objectType: string
    type: CustomFieldType
  }

  export interface CustomFieldSnapshotItem {
    _id: string
    description: string
    thumbUrl: string
    title: string
    url: string
    meta?: {}
  }

  export interface CustomFieldWorkSnapshotItem {
    _id: FileId
    fileType: string
    fileName: string
    fileSize: number
    thumbnail: string
    thumbnailUrl: string
    fileCategory: string
  }

  export interface CustomFieldValue {
    _customfieldId: CustomFieldId
    type: CustomFieldType
    value: Array<CustomFieldSnapshotItem> | Array<CustomFieldWorkSnapshotItem>
    values: string[] // deprecated
  }

  export interface OnTimeReminderRule {
    type: Extract<ReminderRuleType, 'startDate' | 'dueDate'>
    date: null
  }

  export interface AbsoluteReminderRule {
    type: Extract<ReminderRuleType, 'customize'>
    date: string
  }

  export interface RelativeReminderRule {
    type: Extract<ReminderRuleType, 'beforeStartDate' | 'beforeDueDate' | 'afterStartDate' | 'afterDueDate'>
    date: null
    relative: {
      unit: ReminderUnit
      value: number
    }
  }

  export type ReminderRule = OnTimeReminderRule | AbsoluteReminderRule | RelativeReminderRule

  export interface Reminder {
    date: string  // 兼容旧版本，新功能开发请使用 rules
    type: ReminderType  // 兼容旧版本，新功能开发请使用 rules
    members: UserId[]
    rules: ReminderRule[]
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

  export interface PermissionBinding {
    level: UserLevel
    orgLevel: UserLevel
    permissions: string[]
    type: 'project' // | 'organization' // 暂时没有使用 'organization' 的场景，启用时恢复，并调整结构定义
    _projectId: ProjectId
    isJoined: boolean
    joinProjectRole: JoinProjectRole
    externalRoleIds: CustomRoleId[]   // 项目分组所授予的项目角色 id 列表
    memberRoleId: CustomRoleId | null  // 项目成员的项目角色 id
  }

  export interface UserSnippet {
    _id: UserId
    name: string
    avatarUrl: string
  }

  export interface ExecutorOrCreator extends UserSnippet {
    isRobot?: boolean
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

  export interface RecommendMemberSchema extends UserSnippet {
    email: string
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

  export type TapBaseDataType = 'type/MongoId' | 'type/Date' | 'type/DateCollection' | 'type/Number' | 'type/String' | 'type/Boolean'

  export type TapSupportedRelative = 'all' | 'past7days' | 'pastmonth' | 'past3months'

  export type TapSupportedDateSeries = '0to3' | '3to6' | '6to10' | '10to14' | '14plus'

  export type TapSupportedWeekSeries = '1w' | '1to2w' | '2to4w' | '4wplus'

  export type TapFilterComponent = 'member' | 'singleSprint' | 'Mixed'

  export type TapSelectSection = 'storypoint' | 'worktime' | 'taskcount' | 'taskpercent'

  export type TapDateSeries = 'day' | 'week' | 'month' | 'year'

  export type TapChartType = 'pie' | 'bar' | 'line' | 'area' | 'scatter'

  export type TapDimensionBaseDataType = 'string' | 'datetime' | 'dropDown' | 'text' | 'boolean' | 'int'

  export type TapChartOperator = '~' | '=' | '<' | '>=' | 'in'

  export type TapCustomFieldChoiceItem = { _id: string, value: string }

  type TapDimensionType = {
    dataType: TapDimensionBaseDataType
    column: TapBaseRefType
    format: null | TapDateSeries
    name: string
    choices: null | TapCustomFieldChoiceItem[]
  }

  export interface TapDashboardSection {
    section: TapSelectSection
    name: string
  }

  export interface TapChartProject {
    id: ProjectId
    logo: string
    name: string
  }

  export interface TapCrossUser {
    id: UserId
    avatarUrl: string
    name: string
  }

  export type TapFilterTarget<R extends TapBaseRefType, D extends TapBaseDataType | TapDimensionBaseDataType, U> = {
    component: TapFilterComponent
    column: R
    dataType: D
    refData: U
    name: string
    choices?: null | TapCustomFieldChoiceItem[]
    op?: TapChartOperator
  }

  export interface TapDataSettings {
    timeCycle?: TapDateSeries
    taskType?: ScenarioFieldConfigId
    startOfTaskFlowId?: TaskflowStatusId
    endOfTaskFlowId?: TaskflowStatusId
  }

  export interface TapGenericFilterRequest {
    projects?: ProjectId[]
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
    priority?: TaskPriority
    isOverdue?: boolean
    limit?: number
    isSubtask?: boolean
    pageCount?: number
    pageNum?: number
    sprintId?: SprintId[]
    weekend?: number[]
    holiday?: string[]
    groupField?: string
    taskflowId?: TaskflowId[]
    taskflowstatusId?: TaskflowStatusId[]
    dateSeries?: TapSupportedDateSeries[]
    testplanId?: TestplanId
    accomplished?: string
    created?: string
    startDate?: string
    involveMembers?: UserId[]
    scenariofieldconfigId?: ScenarioFieldConfigId[]
    tagIds?: TagId[]
    isDue?: boolean
    proTemplateConfigType?: ScenarioProTemplateConfigType[]
    isDuedateExist?: boolean
    weekSeries?: TapSupportedWeekSeries[]
  }

  export type TapFilterItem =
    | TapFilterTarget<'projectId', 'type/MongoId', ProjectId[]>
    | TapFilterTarget<'executorId', 'type/MongoId', UserId[]>
    | TapFilterTarget<'executorGroup', 'type/MongoId', TeamId[]>
    | TapFilterTarget<'stageId', 'type/MongoId', StageId[]>
    | TapFilterTarget<'organizationId', 'type/MongoId', OrganizationId[]>
    | TapFilterTarget<'creatorId', 'type/MongoId', UserId[]>
    | TapFilterTarget<'creatorGroup', 'type/MongoId', TeamId[]>
    | TapFilterTarget<'tasklistId', 'type/MongoId', TasklistId[]>
    | TapFilterTarget<'createBegin', 'type/Date', string>
    | TapFilterTarget<'createEnd', 'type/Date', string>
    | TapFilterTarget<'createRelative', 'type/String', TapSupportedRelative>
    | TapFilterTarget<'dueBegin', 'type/Date', string>
    | TapFilterTarget<'dueEnd', 'type/Date', string>
    | TapFilterTarget<'dueRelative', 'type/String', TapSupportedRelative>
    | TapFilterTarget<'accBegin', 'type/Date', string>
    | TapFilterTarget<'accEnd', 'type/Date', string>
    | TapFilterTarget<'accRelative', 'type/String', TapSupportedRelative>
    | TapFilterTarget<'startBegin', 'type/Date', string>
    | TapFilterTarget<'startEnd', 'type/Date', string>
    | TapFilterTarget<'startRelative', 'type/String', TapSupportedRelative>
    | TapFilterTarget<'rangeBegin', 'type/Date', string>
    | TapFilterTarget<'rangeEnd', 'type/Date', string>
    | TapFilterTarget<'rangeRelative', 'type/String', TapSupportedRelative>
    | TapFilterTarget<'isDone', 'type/Boolean', boolean>
    | TapFilterTarget<'isArchived', 'type/Boolean', boolean>
    | TapFilterTarget<'priority', 'type/Number', TaskPriority>
    | TapFilterTarget<'isOverdue', 'type/Boolean', boolean>
    | TapFilterTarget<'limit', 'type/Number', number>
    | TapFilterTarget<'isSubtask', 'type/Boolean', boolean>
    | TapFilterTarget<'pageCount', 'type/Number', number>
    | TapFilterTarget<'pageNum', 'type/Number', number>
    | TapFilterTarget<'sprintId', 'type/MongoId', SprintId[]>
    | TapFilterTarget<'weekend', 'type/Number', number[]>
    | TapFilterTarget<'holiday', 'type/DateCollection', string[]>
    | TapFilterTarget<'groupField', 'type/String', string>
    | TapFilterTarget<'taskflowId', 'type/MongoId', TaskflowId[]>
    | TapFilterTarget<'taskflowstatusId', 'type/MongoId', TaskflowStatusId[]>
    | TapFilterTarget<'dateSeries', 'type/String', TapSupportedDateSeries[]>
    | TapFilterTarget<'testplanId', 'type/MongoId', TestplanId[]>
    | TapFilterTarget<'accomplished', 'datetime', string>
    | TapFilterTarget<'startDate', 'datetime', string>
    | TapFilterTarget<'created', 'datetime', string>
    | TapFilterTarget<'involveMembers', 'string', UserId[]>
    | TapFilterTarget<'scenariofieldconfigId', 'int', ScenarioFieldConfigId[]>
    | TapFilterTarget<'tagIds', 'string', TagId[]>
    | TapFilterTarget<'isDue', 'boolean', boolean>
    | TapFilterTarget<'proTemplateConfigType', 'string', ScenarioProTemplateConfigType>
    | TapFilterTarget<'isDuedateExist', 'boolean', boolean>
    | TapFilterTarget<'weekSeries', 'type/String', TapSupportedWeekSeries[]>

  export type TapGenericFilterResponse = TapFilterItem[]
}
