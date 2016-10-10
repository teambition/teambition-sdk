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
  ReportAnalysisSchema
} from '../teambition'

export interface ProjectCreateOptions {
  name: string
  _organizationId?: string
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
  _organizationId?: string
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
  _id: string
  _organizationId: string
  updated: string
}

export interface UnarchiveProjectResponse {
  _id: string
  isArchive: boolean
  updated: string
}

export interface StarProjectResponse {
  _id: string
  isStar: boolean
  starsCount: number
}

export interface UnstarProjectResponse {
  _id: string
  isStar: boolean
  starsCount: number
}

export interface ArchiveProjectResponse {
  _id: string
  isArchived: boolean
  updated: string
}

export interface SetDefaultRoleResponse {
  _id: string
  _roleId: string
}

export type GetAnalysisReportUnit = 'week' | 'month' | 'quarter' | 'year' | number

export class ProjectFetch extends BaseFetch {

  getAll(querys?: any): Observable<ProjectData[]> {
    return this.fetch.get(`projects`, querys)
  }

  getPersonal(querys?: any): Observable<ProjectData[]> {
    return this.fetch.get(`projects/personal`, querys)
  }

  getOrgs(_organizationId: string, querys?: any): Observable<ProjectData[]> {
    return this.fetch.get(`organizations/${_organizationId}/projects`, querys)
  }

  getOne(_id: string, querys?: any): Observable<ProjectData> {
    return this.fetch.get(`projects/${_id}`, querys)
  }

  create(projectInfo: ProjectCreateOptions): Observable<ProjectData> {
    return this.fetch.post('projects', projectInfo)
  }

  update(_id: string, updateInfo: ProjectUpdateOptions): Observable<any> {
    return this.fetch.put(`projects/${_id}`, updateInfo)
  }

  delete(_id: string): Observable<{}> {
    return this.fetch.delete(`projects/${_id}`)
  }

  archive(_id: string): Observable<ArchiveProjectResponse> {
    return this.fetch.put(`projects/${_id}/archive`)
  }

  clearUnreadCount(_id: string): Observable<{}> {
    return this.fetch.put(`projects/${_id}/unreadCount`)
  }

  copy(_id: string, copyInfo: ProjectCopyOptions): Observable<ProjectData> {
    return this.fetch.post(`projects/${_id}/copy`, copyInfo)
  }

  createdInProject(_id: string, querys?: any): Observable<CreatedInProjectSchema> {
    return this.fetch.get(`projects/${_id}/statistic/created`, querys)
  }

  getEvents(_id: string, querys?: any): Observable<Event[]> {
    return this.fetch.get(`projects/${_id}/events`, querys)
  }

  getEventsCountByMonth(_id: string, querys?: any): Observable<{
    month: string
    count: number
  }[]> {
    return this.fetch.get(`projects/${_id}/events_count`, querys)
  }

  getInviteLink(_id: string, querys?: any): Observable<InviteLinkSchema> {
    return this.fetch.get(`projects/${_id}/invitelink`, querys)
  }

  getHomeActivities(_id: string, query?: any): Observable<HomeActivityData[]> {
    return this.fetch.get(`projects/${_id}/activities`, query)
  }

  join(_id: string): Observable<{}> {
    return this.fetch.post(`v2/projects/${_id}/join`)
  }

  quit(_id: string, _ownerId?: string): Observable<{}> {
    return this.fetch.put(`projects/${_id}/quit`, _ownerId ? {
      _ownerId: _ownerId
    } : undefined)
  }

  getRecommendMembers(_id: string, querys?: any): Observable<RecommendMemberSchema> {
    return this.fetch.get(`projects/${_id}/RecommendMemberSchemas`, querys)
  }

  resendInvitation(_id: string, userId: string): Observable<{}> {
    return this.fetch.put(`projects/${_id}/members/${userId}/resend`)
  }

  resetInviteLink(_id: string): Observable<InviteLinkSchema> {
    return this.fetch.put(`projects/${_id}/invitelink`)
  }

  setDefaultRole (_id: string, _roleId?: number): Observable<SetDefaultRoleResponse> {
    return this.fetch.put(`projects/${_id}/_defaultRoleId`, _roleId ? {
      _roleId: _roleId
    } : null)
  }

  star(_projectId: string): Observable<StarProjectResponse> {
    return this.fetch.put(`projects/${_projectId}/star`)
  }

  unstar(_projectId: string): Observable<UnstarProjectResponse> {
    return this.fetch.delete(`projects/${_projectId}/star`)
  }

  getStatistic (_id: string, query?: {
    today: string,
    [index: string]: any
  }): Observable<ProjectStatisticSchema> {
    return this.fetch.get(`projects/${_id}/statistic`, query)
  }

  transfer(_id: string, organizationId?: string): Observable<TransferProjectResponse> {
    return this.fetch.put(`projects/${_id}/transfer`, {
      _organizationId: organizationId
    })
  }

  unarchive(_id: string): Observable<UnarchiveProjectResponse> {
    return this.fetch.put(`projects/${_id}/unarchive`)
  }

  navigation(_id: string, dict: NavigationOptions): Observable<NavigationOptions & {_id: string, updated: string}> {
    return this.fetch.put(`projects/${_id}/navigation`, dict)
  }

  updatePushStatus (_id: string, pushStatus: boolean): Observable<{pushStatus: boolean}> {
    return this.fetch.put(`projects/${_id}/pushStatus`, {
      pushStatus: pushStatus
    })
  }

  updateTasklistIds (_id: string, tasklistIds: string[]): Observable<{tasklistIds: string[]}> {
    return this.fetch.put(`projects/${_id}/tasklistIds`, {
      tasklistIds: tasklistIds
    })
  }

  getReportSummary (_projectId: string, query?: any): Observable<ReportSummarySchema> {
    return this.fetch.get(`projects/${_projectId}/report-summary`, query)
  }

  getAnalysisReport(_projectId: string, startDate: string, endDate: string, unit: GetAnalysisReportUnit): Observable<ReportAnalysisSchema> {
    return this.fetch.get(`projects/${_projectId}/analysis-report`, { startDate, endDate, unit })
  }
}

export default new ProjectFetch()
