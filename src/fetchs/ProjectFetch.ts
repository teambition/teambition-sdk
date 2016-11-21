'use strict'
import { Observable } from 'rxjs/Observable'
import BaseFetch from './BaseFetch'
import { ProjectData } from '../schemas/Project'
import { HomeActivityData } from '../schemas/HomeActivity'
import Event from '../schemas/Event'
import {
  InviteLinkSchema,
  visibility,
  CreatedInProjectSchema,
  RecommendMemberSchema,
  ProjectStatisticSchema,
  ReportSummarySchema,
  ReportAnalysisSchema,
  OrganizationId,
  ProjectId,
  TaskId,
  RoleId,
  UserId
} from '../teambition'

export interface ProjectCreateOptions {
  name: string
  _organizationId?: OrganizationId
  description?: string
  logo?: string
  category?: string
  dividerIndex?: number
  visibility?: visibility
}

export interface ProjectUpdateOptions {
  name?: string
  description?: string
  logo?: string
  category?: string
  visibility?: visibility
}

export interface ProjectCopyOptions {
  name: string
  _organizationId?: OrganizationId
  visibility?: visibility
}

export interface NavigationOptions {
  navigation: {
    home: number
    tasks: number
    posts: number
    files: number
    events: number
    review: number
    tags: number
    bookkeeping: number
    groupchat: number
  }
}

export interface ProjectTasksOptions {
  isDone?: boolean
  page?: number
  count?: number
  dueDate?: string
  startDate?: string
}

export interface TransferProjectResponse {
  _id: ProjectId
  _organizationId: OrganizationId
  updated: string
}

export interface UnarchiveProjectResponse {
  _id: ProjectId
  isArchive: boolean
  updated: string
}

export interface StarProjectResponse {
  _id: ProjectId
  isStar: boolean
  starsCount: number
}

export interface UnstarProjectResponse {
  _id: ProjectId
  isStar: boolean
  starsCount: number
}

export interface ArchiveProjectResponse {
  _id: ProjectId
  isArchived: boolean
  updated: string
}

export interface SetDefaultRoleResponse {
  _id: ProjectId
  _roleId: RoleId
}

export type GetAnalysisReportUnit = 'week' | 'month' | 'quarter' | 'year' | number

export class ProjectFetch extends BaseFetch {

  getAll(querys?: any): Observable<ProjectData[]> {
    return this.fetch.get(`projects`, querys)
  }

  getPrivate(taskId: TaskId, query?: any): Observable<ProjectData> {
    return this.fetch.get(`tasks/${taskId}/inbox/project`, query)
  }

  getPersonal(querys?: any): Observable<ProjectData[]> {
    return this.fetch.get(`projects/personal`, querys)
  }

  getOrgs(_organizationId: OrganizationId, querys?: any): Observable<ProjectData[]> {
    return this.fetch.get(`organizations/${_organizationId}/projects`, querys)
  }

  getOne(_id: ProjectId, querys?: any): Observable<ProjectData> {
    return this.fetch.get(`projects/${_id}`, querys)
  }

  create(projectInfo: ProjectCreateOptions): Observable<ProjectData> {
    return this.fetch.post('projects', projectInfo)
  }

  update(_id: ProjectId, updateInfo: ProjectUpdateOptions): Observable<any> {
    return this.fetch.put(`projects/${_id}`, updateInfo)
  }

  delete(_id: ProjectId): Observable<{}> {
    return this.fetch.delete(`projects/${_id}`)
  }

  archive(_id: ProjectId): Observable<ArchiveProjectResponse> {
    return this.fetch.put(`projects/${_id}/archive`)
  }

  clearUnreadCount(_id: ProjectId): Observable<{}> {
    return this.fetch.put(`projects/${_id}/unreadCount`)
  }

  copy(_id: ProjectId, copyInfo: ProjectCopyOptions): Observable<ProjectData> {
    return this.fetch.post(`projects/${_id}/copy`, copyInfo)
  }

  createdInProject(_id: ProjectId, querys?: any): Observable<CreatedInProjectSchema> {
    return this.fetch.get(`projects/${_id}/statistic/created`, querys)
  }

  getEvents(_id: ProjectId, querys?: any): Observable<Event[]> {
    return this.fetch.get(`projects/${_id}/events`, querys)
  }

  getEventsCountByMonth(_id: ProjectId, querys?: any): Observable<{
    month: string
    count: number
  }[]> {
    return this.fetch.get(`projects/${_id}/events_count`, querys)
  }

  getInviteLink(_id: ProjectId, querys?: any): Observable<InviteLinkSchema> {
    return this.fetch.get(`projects/${_id}/invitelink`, querys)
  }

  getHomeActivities(_id: ProjectId, query?: any): Observable<HomeActivityData[]> {
    return this.fetch.get(`projects/${_id}/activities`, query)
  }

  join(_id: ProjectId): Observable<{}> {
    return this.fetch.post(`v2/projects/${_id}/join`)
  }

  quit(_id: ProjectId, _ownerId?: UserId): Observable<{}> {
    return this.fetch.put(`projects/${_id}/quit`, _ownerId ? {
      _ownerId: _ownerId
    } : undefined)
  }

  getRecommendMembers(_id: ProjectId, querys?: any): Observable<RecommendMemberSchema> {
    return this.fetch.get(`projects/${_id}/RecommendMemberSchemas`, querys)
  }

  resendInvitation(_id: ProjectId, userId: UserId): Observable<{}> {
    return this.fetch.put(`projects/${_id}/members/${userId}/resend`)
  }

  resetInviteLink(_id: ProjectId): Observable<InviteLinkSchema> {
    return this.fetch.put(`projects/${_id}/invitelink`)
  }

  setDefaultRole (_id: ProjectId, _roleId?: RoleId): Observable<SetDefaultRoleResponse> {
    return this.fetch.put(`projects/${_id}/_defaultRoleId`, _roleId ? {
      _roleId: _roleId
    } : null)
  }

  star(_projectId: ProjectId): Observable<StarProjectResponse> {
    return this.fetch.put(`projects/${_projectId}/star`)
  }

  unstar(_projectId: ProjectId): Observable<UnstarProjectResponse> {
    return this.fetch.delete(`projects/${_projectId}/star`)
  }

  getStatistic (_id: ProjectId, query?: {
    today: string,
    [index: string]: any
  }): Observable<ProjectStatisticSchema> {
    return this.fetch.get(`projects/${_id}/statistic`, query)
  }

  transfer(_id: ProjectId, organizationId?: OrganizationId): Observable<TransferProjectResponse> {
    return this.fetch.put(`projects/${_id}/transfer`, {
      _organizationId: organizationId
    })
  }

  unarchive(_id: ProjectId): Observable<UnarchiveProjectResponse> {
    return this.fetch.put(`projects/${_id}/unarchive`)
  }

  navigation(_id: ProjectId, dict: NavigationOptions): Observable<NavigationOptions & {_id: string, updated: string}> {
    return this.fetch.put(`projects/${_id}/navigation`, dict)
  }

  updatePushStatus (_id: ProjectId, pushStatus: boolean): Observable<{pushStatus: boolean}> {
    return this.fetch.put(`projects/${_id}/pushStatus`, {
      pushStatus: pushStatus
    })
  }

  updateTasklistIds (_id: ProjectId, tasklistIds: string[]): Observable<{tasklistIds: string[]}> {
    return this.fetch.put(`projects/${_id}/tasklistIds`, {
      tasklistIds: tasklistIds
    })
  }

  getReportSummary (_projectId: ProjectId, query?: any): Observable<ReportSummarySchema> {
    return this.fetch.get(`projects/${_projectId}/report-summary`, query)
  }

  getAnalysisReport(_projectId: ProjectId, startDate: string, endDate: string, unit: GetAnalysisReportUnit): Observable<ReportAnalysisSchema> {
    return this.fetch.get(`projects/${_projectId}/analysis-report`, { startDate, endDate, unit })
  }
}

export default new ProjectFetch
