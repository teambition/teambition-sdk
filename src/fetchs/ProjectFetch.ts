'use strict'
import BaseFetch from './BaseFetch'
import Project from '../schemas/Project'
import Member from '../schemas/Member'
import Event from '../schemas/Event'
import Task from '../schemas/Task'
import {
  HomeActivity,
  InviteLinkData,
  visibility,
  CreatedInProject,
  RecommendMember,
  ProjectStatistic
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

export class ProjectFetch extends BaseFetch {

  getAll(querys?: any): Promise<Project[]> {
    return this.fetch.get(`projects`, querys)
  }

  getOne(_id: string, querys?: any): Promise<Project> {
    return this.fetch.get(`projects/${_id}`, querys)
  }

  create(projectInfo: ProjectCreateOptions): Promise<Project> {
    return this.fetch.post('projects', projectInfo)
  }

  update(_id: string, updateInfo: ProjectUpdateOptions): Promise<any> {
    return this.fetch.put(`projects/${_id}`, updateInfo)
  }

  delete(_id: string): Promise<{}> {
    return this.fetch.delete(`projects/${_id}`)
  }

  archive(_id: string): Promise<{
    _id: string
    isArchived: boolean
    updated: string
  }> {
    return this.fetch.put(`projects/${_id}/archive`)
  }

  clearUnreadCount(_id: string): Promise<{}> {
    return this.fetch.put(`projects/${_id}/unreadCount`)
  }

  copy(_id: string, copyInfo: ProjectCopyOptions): Promise<Project> {
    return this.fetch.post(`projects/${_id}/copy`, copyInfo)
  }

  createdInProject(_id: string, querys?: any): Promise<CreatedInProject> {
    return this.fetch.get(`projects/${_id}/statistic/created`, querys)
  }

  getEvents(_id: string, querys?: any): Promise<Event[]> {
    return this.fetch.get(`projects/${_id}/events`, querys)
  }

  getEventsCountByMonth(_id: string, querys?: any): Promise<{
    month: string
    count: number
  }[]> {
    return this.fetch.get(`projects/${_id}/events_count`, querys)
  }

  getInviteLink(_id: string, querys?: any): Promise<InviteLinkData> {
    return this.fetch.get(`projects/${_id}/invitelink`, querys)
  }

  getProjectMembers(_id: string, querys?: any): Promise<Member[]> {
    return this.fetch.get<Member[]>(`projects/${_id}/members`, querys)
  }

  getTasks(_id: string, query?: any): Promise<Task[]> {
    return this.fetch.get(`projects/${_id}/tasks`, query)
  }

  getHomeActivities(_id: string, query?: any): Promise<HomeActivity[]> {
    return this.fetch.get(`projects/${_id}/activities`, query)
  }

  join(_id: string): Promise<{}> {
    return this.fetch.post(`v2/projects/${_id}/join`)
  }

  quit(_id: string, _ownerId?: string): Promise<{}> {
    return this.fetch.put(`projects/${_id}/quit`, _ownerId ? {
      _ownerId: _ownerId
    } : undefined)
  }

  getRecommendMembers(_id: string, querys?: any): Promise<RecommendMember> {
    return this.fetch.get(`projects/${_id}/recommendMembers`, querys)
  }

  resendInvitation(_id: string, userId: string): Promise<{}> {
    return this.fetch.put(`projects/${_id}/members/${userId}/resend`)
  }

  resetInviteLink(_id: string): Promise<InviteLinkData> {
    return this.fetch.put(`projects/${_id}/invitelink`)
  }

  setDefaultRole (_id: string, _roleId?: number): Promise<{
    _id: string
    _roleId: string
  }> {
    return this.fetch.put(`projects/${_id}/_defaultRoleId`, _roleId ? {
      _roleId: _roleId
    } : null)
  }

  star(_id: string): Promise<{
    _id: string
    isStar: boolean
    starsCount: number
  }> {
    return this.fetch.put(`projects/${_id}/star`)
  }

  getStatistic (_id: string, query?: {
    today: string,
    [index: string]: any
  }): Promise<ProjectStatistic> {
    return this.fetch.get(`projects/${_id}/statistic`, query)
  }

  transfer(_id: string, organizationId?: string): Promise<{
    _organizationId: string
    updated: string
  }> {
    return this.fetch.put(`projects/${_id}/transfer`, {
      _organizationId: organizationId
    })
  }

  unarchive(_id: string): Promise<{
    _id: string
    isArchive: boolean
    updated: string
  }> {
    return this.fetch.put(`projects/${_id}/unarchive`)
  }

  navigation(_id: string, dict: NavigationOptions): Promise<NavigationOptions & {_id: string, updated: string}> {
    return this.fetch.put(`projects/${_id}/navigation`, dict)
  }

  updatePushStatus (_id: string, pushStatus: boolean): Promise<{pushStatus: boolean}> {
    return this.fetch.put(`projects/${_id}/pushStatus`, {
      pushStatus: pushStatus
    })
  }

  updateTasklistIds (_id: string, tasklistIds: string[]): Promise<{tasklistIds: string[]}> {
    return this.fetch.put(`projects/${_id}/tasklistIds`, {
      tasklistIds: tasklistIds
    })
  }

  subscribeSocket(consumerId: string): Promise<any> {
    return this.fetch.post(`projects/subscribe`, {
      consumerId: consumerId
    })
  }
}

export default new ProjectFetch()
