'use strict'
import BaseFetch from './base'
import Project from '../schemas/Project'
import Member from '../schemas/Member'
import Event from '../schemas/Event'
import Task from '../schemas/Task'
import {HomeActivity, InviteLinkData} from '../teambition'

export type visibility = 'project' | 'organization' | 'all'

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
  visibility: visibility
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

export class ProjectFetch extends BaseFetch {

  getAll(): Promise<Project[]> {
    return this.fetch.get(`projects`)
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

  addMember(_id: string, emails: string | any[]): Promise<Member> {
    return this.fetch.post(`v2/projects/${_id}/members`, {
      email: emails
    })
  }

  addMemberByCode(_id: string, signCode: string, invitorId: string): Promise<void> {
    return this.fetch.post<void>(`projects/${_id}/joinByCode${signCode}`, {
      _invitorId: invitorId
    })
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

  createdInProject(_id: string): Promise<{
    work: number
    post: number
    event: number
    task: number
  }> {
    return this.fetch.get(`projects/${_id}/statistic/created`)
  }

  getEvents(_id: string): Promise<Event[]> {
    return this.fetch.get(`projects/${_id}/events`)
  }

  getEventsCountByMonth(_id: string): Promise<{
    month: string
    count: number
  }[]> {
    return this.fetch.get(`projects/${_id}/events_count`)
  }

  getInviteLink(_id: string): Promise<InviteLinkData> {
    return this.fetch.get(`projects/${_id}/invitelink`)
  }

  getProjectMembers(_id: string): Promise<Member[]> {
    return this.fetch.get<Member[]>(`projects/${_id}/members`)
  }

  getTasks(_id: string, query?: string): Promise<Task[]> {
    const queryString = this.buildQuery(query)
    return this.fetch.get(`projects/${_id}/tasks${queryString}`)
  }

  getHomeActivities(_id: string, query?: any): Promise<HomeActivity[]> {
    const queryString = this.buildQuery(query)
    return this.fetch.get(`projects/${_id}/activities${queryString}`)
  }

  join(_id: string): Promise<{}> {
    return this.fetch.post(`v2/projects/${_id}/join`)
  }

  quit(_id: string, _ownerId?: string): Promise<{}> {
    return this.fetch.put(`projects/${_id}/quit`, {
      _ownerId: _ownerId
    })
  }

  getRecommendMembers(_id: string): Promise<{
    _id: string
    email: string
    avatarUrl: string
    name: string
    latestActived: string
    isActive: boolean
    website: string
    title: string
    location: string
  }> {
    return this.fetch.get(`projects/${_id}/recommendMembers`)
  }

  resendInvitation(_id: string, userId: string): Promise<{}> {
    return this.fetch.put(`projects/${_id}/members/${userId}/resend`)
  }

  resetInviteLink(_id: string): Promise<InviteLinkData> {
    return this.fetch.put(`projects/${_id}/invitelink`)
  }

  setDefaultRole (_id: string, _roleId?: string): Promise<{
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
    starCount: number
  }> {
    return this.fetch.put(`projects/${_id}/star`)
  }

  getStatistic (_id: string, today?: string): Promise<{
    task: {
      total: number
      done: number
      today: number
    }
    recent: number[]
    days: number[][]
  }> {
    return this.fetch.get(`projects/${_id}/statistic?today=${today}`)
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

}
