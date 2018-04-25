'use strict'
import { Schema, ISchema, schemaName, child, bloodyParent } from './schema'
import {
  ExecutorOrCreator,
  Visibility,
  TagId,
  TaskId,
  StageId,
  UserId,
  TasklistId,
  ProjectId,
  OrganizationId,
  CustomFieldValue,
  ScenarioFieldConfigId,
  SprintId,
  TaskflowStatusId
} from '../teambition'
import { StageData } from './Stage'
import { TasklistData } from './Tasklist'
import { OrganizationData } from './Organization'
import { TaskflowStatusData } from './TaskflowStatus'
import { TagData } from './Tag'
import { ProjectData } from './Project'

export type TaskPriority = number | 1 | 2

export interface TaskSubtaskCount {
  done: number
  total: number
}

export interface TaskWorkTime {
  totalTime: number
  unit?: 'minute'
  usedTime: number
}

export interface TaskReminder {
  _creatorId: UserId | null
  date: string | null
  members: UserId[]
  type: string
}

export type TaskOrganization = Pick<OrganizationData,
  | '_id'
  | 'description'
  | 'isPublic'
  | 'logo'
  | 'name'
  | 'plan'
  > & { isExpired: boolean }

export interface TaskData extends ISchema {
  _creatorId: UserId
  _executorId: UserId
  _id: TaskId
  _organizationId: OrganizationId | null
  _projectId: ProjectId
  _scenariofieldconfigId: ScenarioFieldConfigId
  _sourceId: TaskId | null
  _sprintId: SprintId | null
  _stageId: StageId
  _taskId?: TaskId
  _taskflowstatusId: TaskflowStatusId | null
  _tasklistId: TasklistId
  accomplished: string | null
  ancestorIds: TaskId[]
  ancestors?: Partial<TaskData>[]
  attachmentsCount: number
  commentsCount: number
  content: string
  created: string
  customfields: CustomFieldValue[]
  dueDate: string | null
  executor: ExecutorOrCreator
  involveMembers: UserId[]
  involvers?: ExecutorOrCreator[]
  isArchived: boolean
  isDone: boolean
  isFavorite: boolean
  likesCount: number
  note: string
  objectlinksCount: number
  organization: TaskOrganization | null
  parent: Partial<TaskData> | null
  pos: number
  priority: number
  progress: number
  project?: Pick<ProjectData, '_id' | 'name' | 'isArchived'> | null
  rating: number
  recurrence: string[] | null
  reminder: TaskReminder
  shareStatus: number
  sourceDate: string | null
  stage?: Pick<StageData, '_id' | 'name'>
  startDate: string | null
  storyPoint: null
  subtaskCount: TaskSubtaskCount
  subtasks: Partial<TaskData>[]
  tagIds: TagId[]
  tags?: Pick<TagData, '_id' | 'name' | 'color'>[]
  taskflowstatus?: Pick<TaskflowStatusData, '_id' | '_taskflowId' | 'kind' | 'name' | 'pos' | 'rejectStatusIds'> | null
  tasklist?: Pick<TasklistData, '_id' | 'title'>
  uniqueId: number
  untilDate?: null
  updated: string
  visible: Visibility
  workTime: TaskWorkTime
}

@schemaName('Task')
export default class Task extends Schema<TaskData> implements TaskData {
  @bloodyParent('Organization') _organizationId: OrganizationId | null = undefined
  @bloodyParent('Stage') _stageId: StageId = undefined
  @child('Array', 'Tag') tags?: Pick<TagData, '_id' | 'name' | 'color'>[]
  @child('Array', 'Task') subtasks: Partial<TaskData>[] = undefined
  @child('Object', 'Organization') organization: TaskOrganization | null = undefined
  @child('Object', 'Project') project?: Pick<ProjectData, '_id' | 'name' | 'isArchived'> | null
  @child('Object', 'Stage') stage?: Pick<StageData, '_id' | 'name'> = undefined
  @child('Object', 'TaskflowStatus') taskflowstatus?: TaskData['taskflowstatus'] = undefined
  @child('Object', 'Tasklist') tasklist?: Pick<TasklistData, '_id' | 'title'> = undefined
  _creatorId: UserId = undefined
  _executorId: UserId = undefined
  _id: TaskId = undefined
  _projectId: ProjectId = undefined
  _scenariofieldconfigId: ScenarioFieldConfigId = undefined
  _sourceId: TaskId | null = undefined
  _sprintId: SprintId | null = undefined
  _taskId?: TaskId
  _taskflowstatusId: TaskflowStatusId | null = undefined
  _tasklistId: TasklistId = undefined
  accomplished: string | null = undefined
  ancestorIds: TaskId[] = undefined
  ancestors?: Partial<TaskData>[] = undefined
  attachmentsCount: number = undefined
  commentsCount: number = undefined
  content: string = undefined
  created: string = undefined
  customfields: CustomFieldValue[] = undefined
  dueDate: string | null = undefined
  executor: ExecutorOrCreator = undefined
  involveMembers: UserId[] = undefined
  involvers?: ExecutorOrCreator[] = undefined
  isArchived: boolean = undefined
  isDone: boolean = undefined
  isFavorite: boolean = undefined
  likesCount: number = undefined
  note: string = undefined
  objectlinksCount: number = undefined
  parent: Partial<TaskData> | null = undefined
  pos: number = undefined
  priority: number = undefined
  progress: number = undefined
  rating: number = undefined
  recurrence: string[] | null = undefined
  reminder: TaskReminder = undefined
  shareStatus: number = undefined
  sourceDate: string | null = undefined
  startDate: string | null = undefined
  storyPoint: null = undefined
  subtaskCount: TaskSubtaskCount = undefined
  tagIds: TagId[] = undefined
  uniqueId: number = undefined
  untilDate?: null = undefined
  updated: string = undefined
  visible: Visibility = undefined
  workTime: TaskWorkTime = undefined
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
