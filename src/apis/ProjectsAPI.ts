'use strict'
import { Observable, Observer } from 'rxjs'
import {
  default as ProjectFetch,
  ProjectCreateOptions,
  ProjectUpdateOptions,
  ProjectCopyOptions
} from '../fetchs/ProjectFetch'
import ProjectModel from '../models/ProjectModel'
import Project from '../schemas/Project'
import Event from '../schemas/Event'
import Member from '../schemas/Member'
import { makeColdSignal, errorHandler } from './utils'
import {
  CreatedInProject,
  InviteLinkData,
  HomeActivity,
  RecommendMember,
  ProjectStatistic
} from '../teambition'

export type JSONObj = {
  [index: string]: any
}

export class ProjectsAPI {

  constructor() {
    ProjectModel.destructor()
  }

  getAll(querys?: JSONObj): Observable<Project[]> {
    return makeColdSignal(observer => {
      const get = ProjectModel.getProjects()
      if (get) {
        return get
      }
      return Observable.fromPromise(ProjectFetch.getAll(querys))
        .catch(err => errorHandler(observer, err))
        .concatMap(projects => ProjectModel.addProjects(projects))
    })
  }

  getOrgs(_organizationId: string, querys?: any): Observable<Project[]> {
    return makeColdSignal(observer => {
      const get = ProjectModel.getOrgProjects(_organizationId)
      if (get) {
        return get
      }
      return Observable.fromPromise(ProjectFetch.getOrgs(_organizationId, querys))
        .catch(err => errorHandler(observer, err))
        .concatMap(projects => ProjectModel.addOrgsProjects(_organizationId, projects))
    })
  }

  getOne(_id: string, querys?: JSONObj): Observable<Project> {
    return makeColdSignal(observer => {
      const get = ProjectModel.getOne(_id)
      if (get) {
        return get
      }
      return Observable.fromPromise(ProjectFetch.getOne(_id, querys))
        .catch(err => errorHandler(observer, err))
        .concatMap(project => ProjectModel.addOne(project))
    })
  }

  getArchives(): Observable<Project[]> {
    return makeColdSignal(observer => {
      const get = ProjectModel.getArchivesProjects()
      if (get) {
        return get
      }
      return Observable.fromPromise(ProjectFetch.getAll({
        isArchived: true
      }))
        .catch(err => errorHandler(observer, err))
        .concatMap(projects => ProjectModel.addArchivesProjects(projects))
    })
  }

  create(projectInfo: ProjectCreateOptions): Observable<Project> {
    return Observable.create((observer: Observer<Project>) => {
      Observable.fromPromise(ProjectFetch.create(projectInfo))
        .concatMap(project => ProjectModel.addOne(project))
        .forEach(res => observer.next(res))
    })
  }

  update(_id: string, updateInfo: ProjectUpdateOptions): Observable<any> {
    return Observable.create((observer: Observer<any>) => {
      Observable.fromPromise(ProjectFetch.update(_id, updateInfo))
        .concatMap(project => ProjectModel.update(project))
        .forEach(x => observer.next(x))
    })
  }

  delete(_id: string): Observable<void> {
    return Observable.create((observer: Observer<void>) => {
      Observable.fromPromise(ProjectFetch.delete(_id))
        .concatMap(x => ProjectModel.delete(_id))
        .forEach(x => observer.next(null))
    })
  }

  archive(_id: string): Observable<Project> {
    return Observable.create((observer: Observer<Project>) => {
      Observable.fromPromise(ProjectFetch.archive(_id))
        .concatMap(x => ProjectModel.update(<any>{
          _id: _id,
          isArchived: x.isArchived
        }))
        .forEach(x => observer.next(<Project>x))
    })
  }

  clearUnreadCount(_id: string): Observable<any> {
    return Observable.fromPromise(ProjectFetch.clearUnreadCount(_id))
      .concatMap(x => ProjectModel.update(<any>{
        _id: _id,
        unreadCount: 0
      }))
  }

  copy(_id: string, copyInfo: ProjectCopyOptions): Observable<Project> {
    return Observable.fromPromise(ProjectFetch.copy(_id, copyInfo))
      .concatMap(project => ProjectModel.addOne(project))
  }

  createdInProject(_id: string, querys?: JSONObj): Observable<CreatedInProject> {
    return Observable.fromPromise(ProjectFetch.createdInProject(_id, querys))
  }

  /**
   * TODO
   * ADD EVENT MODEL
   */
  getEvents(_id: string, querys?: any): Observable<Event[]> {
    return Observable.fromPromise(ProjectFetch.getEvents(_id, querys))
  }

  getEventsCountByMonth(_id: string, querys?: JSONObj) {
    return Observable.fromPromise(ProjectFetch.getEventsCountByMonth(_id, querys))
  }

  getInviteLink(_id: string, querys?: JSONObj): Observable<InviteLinkData> {
    return Observable.fromPromise(ProjectFetch.getInviteLink(_id, querys))
  }

  /**
   * TODO
   * ADD MEMBER MODEL
   */
  getProjectMembers(_id: string): Observable<Member[]> {
    return Observable.fromPromise(ProjectFetch.getProjectMembers(_id))
  }

  /**
   * TODO
   * ADD HOME ACTIVITY MODEL
   */
  getHomeActivities(_id: string, querys?: JSONObj): Observable<HomeActivity[]> {
    return Observable.fromPromise(ProjectFetch.getHomeActivities(_id, querys))
  }

  join(_id: string): Observable<Project> {
    return Observable.fromPromise(ProjectFetch.join(_id))
      .concatMap(x => this.getOne(_id))
  }

  quit(_id: string, _ownerId?: string): Observable<void> {
    return Observable.fromPromise(ProjectFetch.quit(_id, _ownerId))
      .concatMap(x => ProjectModel.delete(_id))
  }

  getRecommendMembers(_id: string, querys?: JSONObj): Observable<RecommendMember> {
    return Observable.fromPromise(ProjectFetch.getRecommendMembers(_id, querys))
  }

  resendInvitation(_id: string, userId: string): Observable<{}> {
    return Observable.fromPromise(ProjectFetch.resendInvitation(_id, userId))
  }

  resetInviteLink(_id: string): Observable<InviteLinkData> {
    return Observable.fromPromise(ProjectFetch.resetInviteLink(_id))
  }

  setDefaultRole (_id: string, _roleId?: number): Observable<Project> {
    return Observable.fromPromise(ProjectFetch.setDefaultRole(_id, _roleId))
      .concatMap(x => ProjectModel.update(x))
  }

  star(_id: string): Observable<Project> {
    return Observable.fromPromise(ProjectFetch.star(_id))
      .concatMap(x => ProjectModel.update(<any>x))
  }

  getStatistic (_id: string, query?: {
    today: string,
    [index: string]: any
  }): Observable<ProjectStatistic> {
    return Observable.fromPromise(ProjectFetch.getStatistic(_id, query))
  }

  transfer(_id: string, organizationId?: string): Observable<{
    _organizationId: string
    updated: string
  }> {
    return Observable.fromPromise(ProjectFetch.transfer(_id, organizationId))
      .concatMap(x => ProjectModel.update(<any>{
        _organizationId: x._organizationId,
        _id: _id
      }))
  }

}
