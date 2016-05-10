'use strict'
import {Observable} from 'rxjs'
import {
  ProjectFetch,
  ProjectCreateOptions,
  ProjectUpdateOptions,
  ProjectCopyOptions
} from '../fetchs/ProjectFetch'
import ProjectModel from '../models/ProjectModel'
import Project from '../schemas/Project'
import Event from '../schemas/Event'
import Member from '../schemas/Member'
import Task from '../schemas/Task'
import {
  CreatedInProject,
  InviteLinkData,
  HomeActivity,
  RecommendMember,
  ProjectStatistic
} from '../teambition'

const projectFetch = new ProjectFetch()

export type JSONObj = {
  [index: string]: any
}

export class ProjectsAPI {

  getAll(querys?: JSONObj): Observable<Project[]> {
    const get = ProjectModel.getProjects()
    if (get) return get
    return Observable.fromPromise(projectFetch.getAll(querys))
      .concatMap(projects => ProjectModel.addProjects(projects))
  }

  getOrgs(_organizationId: string): Observable<Project[]> {
    const get = ProjectModel.getOrgProjects(_organizationId)
    if (get) return get
    return Observable.fromPromise(projectFetch.getAll({
      _organizationId: _organizationId
    }))
      .concatMap(projects => ProjectModel.addOrgsProjects(_organizationId, projects))
  }

  getOne(_id: string, querys?: JSONObj): Observable<Project> {
    const get = ProjectModel.getOne(_id)
    if (get) return get
    return Observable.fromPromise(projectFetch.getOne(_id, querys))
      .concatMap(project => ProjectModel.addProject(project))
  }

  getArchives(): Observable<Project[]> {
    const get = ProjectModel.getArchivesProjects()
    if (get) return get
    return Observable.fromPromise(projectFetch.getAll({
      isArchived: true
    }))
      .concatMap(projects => ProjectModel.addArchivesProjects(projects))
  }

  create(projectInfo: ProjectCreateOptions): Observable<Project> {
    return Observable.fromPromise(projectFetch.create(projectInfo))
      .concatMap(project => ProjectModel.addProject(project))
  }

  update(_id: string, updateInfo: ProjectUpdateOptions): Observable<any> {
    return Observable.fromPromise(projectFetch.update(_id, updateInfo))
      .concatMap(project => ProjectModel.updateProject(project))
  }

  delete(_id: string): Observable<void> {
    return Observable.fromPromise(projectFetch.delete(_id))
      .concatMap(x => ProjectModel.deleteProject(_id))
  }

  archive(_id: string): Observable<void> {
    return Observable.fromPromise(projectFetch.archive(_id))
      .concatMap(x => ProjectModel.deleteProject(_id))
  }

  clearUnreadCount(_id: string): Observable<any> {
    return Observable.fromPromise(projectFetch.clearUnreadCount(_id))
      .concatMap(x => ProjectModel.updateProject(<any>{
        _id: _id,
        unreadCount: 0
      }))
  }

  copy(_id: string, copyInfo: ProjectCopyOptions): Observable<Project> {
    return Observable.fromPromise(projectFetch.copy(_id, copyInfo))
      .concatMap(project => ProjectModel.addProject(project))
  }

  createdInProject(_id: string, querys?: JSONObj): Observable<CreatedInProject> {
    return Observable.fromPromise(projectFetch.createdInProject(_id, querys))
  }

  /**
   * TODO
   * ADD EVENT MODEL
   */
  getEvents(_id: string, querys?: any): Observable<Event[]> {
    return Observable.fromPromise(projectFetch.getEvents(_id, querys))
  }

  getEventsCountByMonth(_id: string, querys?: JSONObj) {
    return Observable.fromPromise(projectFetch.getEventsCountByMonth(_id, querys))
  }

  getInviteLink(_id: string, querys?: JSONObj): Observable<InviteLinkData> {
    return Observable.fromPromise(projectFetch.getInviteLink(_id, querys))
  }

  /**
   * TODO
   * ADD MEMBER MODEL
   */
  getProjectMembers(_id: string): Observable<Member[]> {
    return Observable.fromPromise(projectFetch.getProjectMembers(_id))
  }

  /**
   * TODO
   * ADD TASK MODEL
   */
  getTasks(_id: string, querys?: JSONObj): Observable<Task[]> {
    return Observable.fromPromise(projectFetch.getTasks(_id, querys))
  }

  /**
   * TODO
   * ADD HOME ACTIVITY MODEL
   */
  getHomeActivities(_id: string, querys?: JSONObj): Observable<HomeActivity[]> {
    return Observable.fromPromise(projectFetch.getHomeActivities(_id, querys))
  }

  join(_id: string): Observable<Project> {
    return Observable.fromPromise(projectFetch.join(_id))
      .concatMap(x => this.getOne(_id))
  }

  quit(_id: string, _ownerId?: string): Observable<void> {
    return Observable.fromPromise(projectFetch.quit(_id, _ownerId))
      .concatMap(x => ProjectModel.deleteProject(_id))
  }

  getRecommendMembers(_id: string, querys?: JSONObj): Observable<RecommendMember> {
    return Observable.fromPromise(projectFetch.getRecommendMembers(_id, querys))
  }

  resendInvitation(_id: string, userId: string): Observable<{}> {
    return Observable.fromPromise(projectFetch.resendInvitation(_id, userId))
  }

  resetInviteLink(_id: string): Observable<InviteLinkData> {
    return Observable.fromPromise(projectFetch.resetInviteLink(_id))
  }

  setDefaultRole (_id: string, _roleId?: number): Observable<Project> {
    return Observable.fromPromise(projectFetch.setDefaultRole(_id, _roleId))
      .concatMap(x => ProjectModel.updateProject(<any>x))
  }

  star(_id: string): Observable<Project> {
    return Observable.fromPromise(projectFetch.star(_id))
      .concatMap(x => ProjectModel.updateProject(<any>x))
  }

  getStatistic (_id: string, query?: {
    today: string,
    [index: string]: any
  }): Observable<ProjectStatistic> {
    return Observable.fromPromise(projectFetch.getStatistic(_id, query))
  }

  transfer(_id: string, organizationId?: string): Observable<{
    _organizationId: string
    updated: string
  }> {
    return Observable.fromPromise(projectFetch.transfer(_id, organizationId))
      .concatMap(x => ProjectModel.updateProject(<any>{
        _organizationId: x._organizationId,
        _id: _id
      }))
  }

}
