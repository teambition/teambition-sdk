'use strict'
import { Observable } from 'rxjs/Observable'
import { Observer } from 'rxjs/Observer'
import {
  default as ProjectFetch,
  ProjectCreateOptions,
  ProjectUpdateOptions,
  ProjectCopyOptions,
  UnarchiveProjectResponse,
  TransferProjectResponse,
  StarProjectResponse,
  UnstarProjectResponse,
  GetAnalysisReportUnit
} from '../fetchs/ProjectFetch'
import ProjectModel from '../models/ProjectModel'
import { ProjectData } from '../schemas/Project'
import { makeColdSignal, errorHandler, observableError } from './utils'
import {
  CreatedInProjectSchema,
  InviteLinkSchema,
  HomeActivitySchema,
  RecommendMemberSchema,
  ProjectStatisticSchema,
  ReportSummarySchema,
  ReportAnalysisSchema
} from '../teambition'

export type JSONObj = {
  [index: string]: any
}

export class ProjectAPI {

  constructor() {
    ProjectModel.destructor()
  }

  getAll(querys?: JSONObj): Observable<ProjectData[]> {
    return makeColdSignal<ProjectData[]>(observer => {
      const get = ProjectModel.getProjects()
      if (get) {
        return get
      }
      return Observable.fromPromise(ProjectFetch.getAll(querys))
        .catch(err => errorHandler(observer, err))
        .concatMap(projects => ProjectModel.addProjects(projects))
    })
  }

  getOrgs(_organizationId: string, querys?: any): Observable<ProjectData[]> {
    return makeColdSignal<ProjectData[]>(observer => {
      const get = ProjectModel.getOrgProjects(_organizationId)
      if (get) {
        return get
      }
      return Observable.fromPromise(ProjectFetch.getOrgs(_organizationId, querys))
        .catch(err => errorHandler(observer, err))
        .concatMap(projects => ProjectModel.addOrgsProjects(_organizationId, projects))
    })
  }

  getOne(_id: string, querys?: JSONObj): Observable<ProjectData> {
    return makeColdSignal<ProjectData>(observer => {
      const get = ProjectModel.getOne(_id)
      if (get && ProjectModel.checkSchema(_id)) {
        return get
      }
      return Observable.fromPromise(ProjectFetch.getOne(_id, querys))
        .catch(err => errorHandler(observer, err))
        .concatMap(project => ProjectModel.addOne(project))
    })
  }

  getArchives(): Observable<ProjectData[]> {
    return makeColdSignal<ProjectData[]>(observer => {
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

  create(projectInfo: ProjectCreateOptions): Observable<ProjectData> {
    return Observable.create((observer: Observer<ProjectData>) => {
      Observable.fromPromise(ProjectFetch.create(projectInfo))
        .catch(err => observableError(observer, err))
        .concatMap(project => ProjectModel.addOne(project).take(1))
        .forEach(res => observer.next(res))
        .then(() => observer.complete())
    })
  }

  update(_id: string, updateInfo: ProjectUpdateOptions): Observable<any> {
    return Observable.create((observer: Observer<any>) => {
      Observable.fromPromise(ProjectFetch.update(_id, updateInfo))
        .catch(err => observableError(observer, err))
        .concatMap(project => ProjectModel.update(_id, project))
        .forEach(x => observer.next(x))
        .then(() => observer.complete())
    })
  }

  delete(_id: string): Observable<void> {
    return Observable.create((observer: Observer<void>) => {
      Observable.fromPromise(ProjectFetch.delete(_id))
        .catch(err => observableError(observer, err))
        .concatMap(x => ProjectModel.delete(_id))
        .forEach(x => observer.next(null))
        .then(() => observer.complete())
    })
  }

  archive(_id: string): Observable<ProjectData> {
    return Observable.create((observer: Observer<ProjectData>) => {
      Observable.fromPromise(ProjectFetch.archive(_id))
        .catch(err => observableError(observer, err))
        .concatMap(x => ProjectModel.update(_id, x))
        .forEach(x => observer.next(<ProjectData>x))
        .then(() => observer.complete())
    })
  }

  clearUnreadCount(_id: string): Observable<any> {
    return Observable.create((observer: Observer<any>) => {
      Observable.fromPromise(ProjectFetch.clearUnreadCount(_id))
        .catch(err => observableError(observer, err))
        .concatMap(x => ProjectModel.update(_id, x))
        .forEach(r => observer.next(r))
        .then(() => observer.complete())
    })
  }

  copy(_id: string, copyInfo: ProjectCopyOptions): Observable<ProjectData> {
    return Observable.create((observer: Observer<ProjectData>) => {
      Observable.fromPromise(ProjectFetch.copy(_id, copyInfo))
        .catch(err => observableError(observer, err))
        .concatMap(project => ProjectModel.addOne(project))
        .forEach(r => observer.next(r))
        .then(() => observer.complete())
    })
  }

  createdInProject(_id: string, querys?: JSONObj): Observable<CreatedInProjectSchema> {
    return Observable.fromPromise(ProjectFetch.createdInProject(_id, querys))
  }

  getEventsCountByMonth(_id: string, querys?: JSONObj) {
    return Observable.fromPromise(ProjectFetch.getEventsCountByMonth(_id, querys))
  }

  getInviteLink(_id: string, querys?: JSONObj): Observable<InviteLinkSchema> {
    return Observable.fromPromise(ProjectFetch.getInviteLink(_id, querys))
  }

  /**
   * TODO
   * ADD HOME ACTIVITY MODEL
   */
  getHomeActivities(_id: string, querys?: JSONObj): Observable<HomeActivitySchema[]> {
    return Observable.create((observer: Observer<HomeActivitySchema[]>) => {
      Observable.fromPromise(ProjectFetch.getHomeActivities(_id, querys))
        .catch(err => observableError(observer, err))
        .forEach(r => observer.next(r))
        .then(() => observer.complete())
    })
  }

  join(_id: string): Observable<ProjectData> {
    return Observable.create((observer: Observer<ProjectData>) => {
      Observable.fromPromise(ProjectFetch.join(_id))
        .catch(err => observableError(observer, err))
        .concatMap(x => this.getOne(_id).take(1))
        .forEach(r => observer.next(r))
        .then(() => observer.complete())
    })
  }

  quit(_id: string, _ownerId?: string): Observable<void> {
    return Observable.create((observer: Observer<void>) => {
      Observable.fromPromise(ProjectFetch.quit(_id, _ownerId))
        .catch(err => observableError(observer, err))
        .concatMap(x => ProjectModel.delete(_id))
        .forEach(r => observer.next(r))
        .then(() => observer.complete())
    })
  }

  getRecommendMembers(_id: string, querys?: JSONObj): Observable<RecommendMemberSchema> {
    return Observable.fromPromise(ProjectFetch.getRecommendMembers(_id, querys))
  }

  resendInvitation(_id: string, userId: string): Observable<{}> {
    return Observable.fromPromise(ProjectFetch.resendInvitation(_id, userId))
  }

  resetInviteLink(_id: string): Observable<InviteLinkSchema> {
    return Observable.fromPromise(ProjectFetch.resetInviteLink(_id))
  }

  setDefaultRole (_id: string, _roleId?: number): Observable<ProjectData> {
    return Observable.create((observer: Observer<any>) => {
      Observable.fromPromise(ProjectFetch.setDefaultRole(_id, _roleId))
        .catch(err => observableError(observer, err))
        .concatMap(x => ProjectModel.update(_id, x))
        .forEach(r => observer.next(r))
        .then(() => observer.complete())
    })
  }

  star(_projectId: string): Observable<StarProjectResponse> {
    return Observable.create((observer: Observer<StarProjectResponse>) => {
      Observable.fromPromise(ProjectFetch.star(_projectId))
        .catch(err => observableError(observer, err))
        .concatMap(x => ProjectModel.update(_projectId, x))
        .forEach(r => observer.next(r))
        .then(() => observer.complete())
    })
  }

  unstar(_projectId: string): Observable<UnstarProjectResponse> {
    return Observable.create((observer: Observer<UnstarProjectResponse>) => {
      Observable.fromPromise(ProjectFetch.unstar(_projectId))
        .catch(err => observableError(observer, err))
        .concatMap(x => ProjectModel.update(_projectId, x))
        .forEach(r => observer.next(r))
        .then(() => observer.complete())
    })
  }

  getStatistic (_id: string, query?: {
    today: string,
    [index: string]: any
  }): Observable<ProjectStatisticSchema> {
    return Observable.create((observer: Observer<any>) => {
      Observable.fromPromise(ProjectFetch.getStatistic(_id, query))
        .catch(err => observableError(observer, err))
        .forEach(r => observer.next(r))
        .then(() => observer.complete())
    })
  }

  transfer(_id: string, organizationId?: string): Observable<TransferProjectResponse> {
    return Observable.create((observer: Observer<TransferProjectResponse>) => {
      Observable.fromPromise(ProjectFetch.transfer(_id, organizationId))
        .catch(err => observableError(observer, err))
        .concatMap(x => ProjectModel.update(_id, x))
        .forEach(r => observer.next(r))
        .then(() => observer.complete())
    })
  }

  unarchive(_projectId: string): Observable<UnarchiveProjectResponse> {
    return Observable.create((observer: Observer<UnarchiveProjectResponse>) => {
      Observable.fromPromise(ProjectFetch.unarchive(_projectId))
        .catch(err => observableError(observer, err))
        .concatMap(r => ProjectModel.update(_projectId, r))
        .forEach(r => observer.next(r))
        .then(() => observer.complete())
    })
  }

  /**
   * 从一个未 complete 的 get 流中 take(1)
   * 因为这个数据不可能再变更
   */
  getReportSummary (_projectId: string, query?: any): Observable<ReportSummarySchema> {
    return makeColdSignal<ReportSummarySchema>(observer => {
      const index = `reportSummary:${_projectId}`
      let result = ProjectModel.getNonstandardSchema<ReportSummarySchema>(index)
      if (!result) {
        result = Observable.fromPromise(ProjectFetch.getReportSummary(_projectId))
          .catch(err => errorHandler(observer, err))
          .concatMap(r => ProjectModel.saveNonstandardSchema(index, r))
      }
      return result.take(1)
    })
  }

  getAnalysisReport(_projectId: string, startDate: Date, endDate: Date, unit: GetAnalysisReportUnit): Observable<ReportAnalysisSchema> {
    return makeColdSignal<ReportAnalysisSchema>(observer => {
      const index = `reportAnalysis:${_projectId}`
      let result = ProjectModel.getNonstandardSchema<ReportAnalysisSchema>(index)
      if (!result) {
        result = Observable.fromPromise(ProjectFetch.getAnalysisReport(
          _projectId,
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0],
          unit
        ))
          .catch(err => errorHandler(observer, err))
          .concatMap(r => ProjectModel.saveNonstandardSchema(index, r))
      }
      return result.take(1)
    })
  }

}
