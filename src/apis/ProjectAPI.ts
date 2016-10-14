'use strict'
import { Observable } from 'rxjs/Observable'
import {
  default as ProjectFetch,
  ProjectCreateOptions,
  ProjectUpdateOptions,
  ProjectCopyOptions,
  ArchiveProjectResponse,
  UnarchiveProjectResponse,
  TransferProjectResponse,
  StarProjectResponse,
  UnstarProjectResponse,
  SetDefaultRoleResponse,
  GetAnalysisReportUnit
} from '../fetchs/ProjectFetch'
import ProjectModel from '../models/ProjectModel'
import HomeActivityModel from '../models/HomeActivityModel'
import { ProjectData } from '../schemas/Project'
import { HomeActivityData } from '../schemas/HomeActivity'
import { makeColdSignal } from './utils'
import {
  CreatedInProjectSchema,
  InviteLinkSchema,
  RecommendMemberSchema,
  ProjectStatisticSchema,
  ReportSummarySchema,
  ReportAnalysisSchema
} from '../teambition'

export type JSONObj = {
  [index: string]: any
}

export interface GetHomeActivitiesOptions {
  page?: number
  count?: number
  type?: string
  _creatorId?: string
  _teamId?: string
  created?: string
  startDate?: string
  endDate?: string
  fields?: string
}

export class ProjectAPI {

  getAll(querys?: JSONObj): Observable<ProjectData[]> {
    return makeColdSignal<ProjectData[]>(() => {
      const get = ProjectModel.getProjects()
      if (get) {
        return get
      }
      return ProjectFetch.getAll(querys)
        .concatMap(projects => ProjectModel.addProjects(projects))
    })
  }

  getPersonal(querys?: any): Observable<ProjectData[]> {
    return makeColdSignal<ProjectData[]>(() => {
      const get = ProjectModel.getPersonalProjects()
      if (get) {
        return get
      }
      return ProjectFetch.getPersonal(querys)
        .concatMap(projects => ProjectModel.addPersonalProjects(projects))
    })
  }

  getOrgs(_organizationId: string, querys?: any): Observable<ProjectData[]> {
    return makeColdSignal<ProjectData[]>(() => {
      const get = ProjectModel.getOrgProjects(_organizationId)
      if (get) {
        return get
      }
      return ProjectFetch.getOrgs(_organizationId, querys)
        .concatMap(projects => ProjectModel.addOrgsProjects(_organizationId, projects))
    })
  }

  getOne(_id: string, querys?: JSONObj): Observable<ProjectData> {
    return makeColdSignal<ProjectData>(() => {
      const get = ProjectModel.getOne(_id)
      if (get && ProjectModel.checkSchema(_id)) {
        return get
      }
      return ProjectFetch.getOne(_id, querys)
        .concatMap(project => ProjectModel.addOne(project))
    })
  }

  getArchives(): Observable<ProjectData[]> {
    return makeColdSignal<ProjectData[]>(() => {
      const get = ProjectModel.getArchivesProjects()
      if (get) {
        return get
      }
      return ProjectFetch.getAll({
        isArchived: true
      })
        .concatMap(projects => ProjectModel.addArchivesProjects(projects))
    })
  }

  create(projectInfo: ProjectCreateOptions): Observable<ProjectData> {
    return ProjectFetch.create(projectInfo)
      .concatMap(project => ProjectModel.addOne(project).take(1))
  }

  update(_id: string, updateInfo: ProjectUpdateOptions): Observable<any> {
    return ProjectFetch.update(_id, updateInfo)
      .concatMap(project => ProjectModel.update(_id, project))
  }

  delete(_id: string): Observable<void> {
    return ProjectFetch.delete(_id)
      .concatMap(x => ProjectModel.delete(_id))
  }

  archive(_id: string): Observable<ArchiveProjectResponse> {
    return ProjectFetch.archive(_id)
      .concatMap(x => ProjectModel.update(_id, x))
  }

  clearUnreadCount(_id: string): Observable<any> {
    return ProjectFetch.clearUnreadCount(_id)
      .concatMap(x => ProjectModel.update(_id, x))
  }

  copy(_id: string, copyInfo: ProjectCopyOptions): Observable<ProjectData> {
    return ProjectFetch.copy(_id, copyInfo)
      .concatMap(project => ProjectModel.addOne(project).take(1))
  }

  createdInProject(_id: string, querys?: JSONObj): Observable<CreatedInProjectSchema> {
    return ProjectFetch.createdInProject(_id, querys)
  }

  getInviteLink(_id: string, querys?: JSONObj): Observable<InviteLinkSchema> {
    return ProjectFetch.getInviteLink(_id, querys)
  }

  /**
   * 项目主页动态
   */
  getHomeActivities(_id: string, query?: GetHomeActivitiesOptions): Observable<HomeActivityData[]> {
    return makeColdSignal<HomeActivityData[]>(() => {
      const page = (query && query.page) ? query.page : 1
      const cache = HomeActivityModel.get(_id, page)
      if (cache) {
        return cache
      }
      return ProjectFetch.getHomeActivities(_id, query)
        .concatMap(activities => HomeActivityModel.add(_id, activities, page))
    })
  }

  join(_id: string): Observable<ProjectData> {
    return ProjectFetch.join(_id)
      .concatMap(x => this.getOne(_id).take(1))
  }

  quit(_id: string, _ownerId?: string): Observable<void> {
    return ProjectFetch.quit(_id, _ownerId)
      .concatMap(x => ProjectModel.delete(_id))
  }

  getRecommendMembers(_id: string, querys?: JSONObj): Observable<RecommendMemberSchema> {
    return ProjectFetch.getRecommendMembers(_id, querys)
  }

  resendInvitation(_id: string, userId: string): Observable<{}> {
    return ProjectFetch.resendInvitation(_id, userId)
  }

  resetInviteLink(_id: string): Observable<InviteLinkSchema> {
    return ProjectFetch.resetInviteLink(_id)
  }

  setDefaultRole (_id: string, _roleId?: number): Observable<SetDefaultRoleResponse> {
    return ProjectFetch.setDefaultRole(_id, _roleId)
      .concatMap(x => ProjectModel.update(_id, x))
  }

  star(_projectId: string): Observable<StarProjectResponse> {
    return ProjectFetch.star(_projectId)
      .concatMap(x => ProjectModel.update(_projectId, x))
  }

  unstar(_projectId: string): Observable<UnstarProjectResponse> {
    return ProjectFetch.unstar(_projectId)
      .concatMap(x => ProjectModel.update(_projectId, x))
  }

  getStatistic (_id: string, query?: {
    today: string,
    [index: string]: any
  }): Observable<ProjectStatisticSchema> {
    return ProjectFetch.getStatistic(_id, query)
  }

  transfer(_id: string, organizationId?: string): Observable<TransferProjectResponse> {
    return ProjectFetch.transfer(_id, organizationId)
      .concatMap(x => ProjectModel.update(_id, x))
  }

  unarchive(_projectId: string): Observable<UnarchiveProjectResponse> {
    return ProjectFetch.unarchive(_projectId)
      .concatMap(r => ProjectModel.update(_projectId, r))
  }

  /**
   * 从一个未 complete 的 get 流中 take(1)
   * 因为这个数据不可能再变更
   */
  getReportSummary (_projectId: string, query?: any): Observable<ReportSummarySchema> {
    return makeColdSignal<ReportSummarySchema>(() => {
      const index = `reportSummary:${_projectId}`
      let result = ProjectModel.getNonstandardSchema<ReportSummarySchema>(index)
      if (!result) {
        result = ProjectFetch.getReportSummary(_projectId)
          .concatMap(r => ProjectModel.saveNonstandardSchema(index, r))
      }
      return result.take(1)
    })
  }

  getAnalysisReport(_projectId: string, startDate: string, endDate: string, unit: GetAnalysisReportUnit): Observable<ReportAnalysisSchema> {
    return ProjectFetch.getAnalysisReport( _projectId, startDate, endDate, unit)
  }

}

export default new ProjectAPI
