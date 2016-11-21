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
  ReportAnalysisSchema,
  ProjectId,
  TaskId,
  OrganizationId,
  UserId,
  RoleId
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
        .concatMap(projects =>
          ProjectModel.addProjects(projects)
        )
    })
  }

  getPrivate(taskId: TaskId, projectId?: ProjectId, query?: any): Observable<ProjectData> {
    return makeColdSignal<ProjectData>(() => {
      if (projectId) {
        const cache = ProjectModel.getOne(projectId)
        if (cache && ProjectModel.checkSchema(<string>projectId)) {
          return cache
        }
      }
      const aliasId = ProjectModel.getAliasIdOfPrivate(taskId)
      const cache = ProjectModel.getPrivate(taskId)
      if (cache && ProjectModel.checkSchema(aliasId)) {
        return cache
      }
      return ProjectFetch.getPrivate(taskId, query)
        .concatMap(project => ProjectModel.addPrivate(taskId, project))
    })
  }

  getPersonal(querys?: any): Observable<ProjectData[]> {
    return makeColdSignal<ProjectData[]>(() => {
      const get = ProjectModel.getPersonalProjects()
      if (get) {
        return get
      }
      return ProjectFetch.getPersonal(querys)
        .concatMap(projects =>
          ProjectModel.addPersonalProjects(projects)
        )
    })
  }

  getOrgs(_organizationId: OrganizationId, querys?: any): Observable<ProjectData[]> {
    return makeColdSignal<ProjectData[]>(() => {
      const get = ProjectModel.getOrgProjects(_organizationId)
      if (get) {
        return get
      }
      return ProjectFetch.getOrgs(_organizationId, querys)
        .concatMap(projects =>
          ProjectModel.addOrgsProjects(_organizationId, projects)
        )
    })
  }

  getOne(_id: ProjectId, querys?: JSONObj): Observable<ProjectData> {
    return makeColdSignal<ProjectData>(() => {
      const get = ProjectModel.getOne(_id)
      if (get && ProjectModel.checkSchema(<string>_id)) {
        return get
      }
      return ProjectFetch.getOne(_id, querys)
        .concatMap(project =>
          ProjectModel.addOne(project)
        )
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
        .concatMap(projects =>
          ProjectModel.addArchivesProjects(projects)
        )
    })
  }

  create(projectInfo: ProjectCreateOptions): Observable<ProjectData> {
    return ProjectFetch.create(projectInfo)
      .concatMap(project =>
        ProjectModel.addOne(project)
          .take(1)
      )
  }

  update(_id: ProjectId, updateInfo: ProjectUpdateOptions): Observable<string> {
    return ProjectFetch.update(_id, updateInfo)
      .concatMap(project =>
        ProjectModel.update(<string>_id, project)
      )
  }

  delete(_id: ProjectId): Observable<void> {
    return ProjectFetch.delete(_id)
      .concatMap(x =>
        ProjectModel.delete(<string>_id)
      )
  }

  archive(_id: ProjectId): Observable<ArchiveProjectResponse> {
    return ProjectFetch.archive(_id)
      .concatMap(x =>
        ProjectModel.update(<string>_id, x)
      )
  }

  clearUnreadCount(_id: ProjectId): Observable<{
    unreadCount: 0
  }> {
    return ProjectFetch.clearUnreadCount(_id)
      .concatMap(() => ProjectModel.update(<string>_id, <any>{
        unreadCount: 0
      }))
  }

  copy(_id: ProjectId, copyInfo: ProjectCopyOptions): Observable<ProjectData> {
    return ProjectFetch.copy(_id, copyInfo)
      .concatMap(project =>
        ProjectModel.addOne(project)
          .take(1)
      )
  }

  createdInProject(_id: ProjectId, querys?: JSONObj): Observable<CreatedInProjectSchema> {
    return ProjectFetch.createdInProject(_id, querys)
  }

  getInviteLink(_id: ProjectId, querys?: JSONObj): Observable<InviteLinkSchema> {
    return ProjectFetch.getInviteLink(_id, querys)
  }

  /**
   * 项目主页动态
   */
  getHomeActivities(_id: ProjectId, query?: GetHomeActivitiesOptions): Observable<HomeActivityData[]> {
    return makeColdSignal<HomeActivityData[]>(() => {
      const page = (query && query.page) ? query.page : 1
      const cache = HomeActivityModel.get(_id, page)
      if (cache) {
        return cache
      }
      return ProjectFetch.getHomeActivities(_id, query)
        .concatMap(activities =>
          HomeActivityModel.add(_id, activities, page)
        )
    })
  }

  join(_id: ProjectId): Observable<ProjectData> {
    return ProjectFetch.join(_id)
      .concatMap(x =>
        this.getOne(_id)
          .take(1)
      )
  }

  quit(_id: ProjectId, _ownerId?: UserId): Observable<void> {
    return ProjectFetch.quit(_id, _ownerId)
      .concatMap(x =>
        ProjectModel.delete(<string>_id)
      )
  }

  getRecommendMembers(_id: ProjectId, querys?: JSONObj): Observable<RecommendMemberSchema> {
    return ProjectFetch.getRecommendMembers(_id, querys)
  }

  resendInvitation(_id: ProjectId, userId: UserId): Observable<{}> {
    return ProjectFetch.resendInvitation(_id, userId)
  }

  resetInviteLink(_id: ProjectId): Observable<InviteLinkSchema> {
    return ProjectFetch.resetInviteLink(_id)
  }

  setDefaultRole (_id: ProjectId, _roleId?: RoleId): Observable<SetDefaultRoleResponse> {
    return ProjectFetch.setDefaultRole(_id, _roleId)
      .concatMap(x =>
        ProjectModel.update(<string>_id, x)
      )
  }

  star(_projectId: ProjectId): Observable<StarProjectResponse> {
    return ProjectFetch.star(_projectId)
      .concatMap(x =>
        ProjectModel.update(<string>_projectId, x)
      )
  }

  unstar(_projectId: ProjectId): Observable<UnstarProjectResponse> {
    return ProjectFetch.unstar(_projectId)
      .concatMap(x =>
        ProjectModel.update(<string>_projectId, x)
      )
  }

  getStatistic (_id: ProjectId, query?: {
    today: string,
    [index: string]: any
  }): Observable<ProjectStatisticSchema> {
    return ProjectFetch.getStatistic(_id, query)
  }

  transfer(_id: ProjectId, organizationId?: OrganizationId): Observable<TransferProjectResponse> {
    return ProjectFetch.transfer(_id, organizationId)
      .concatMap(x =>
        ProjectModel.update(<string>_id, x)
      )
  }

  unarchive(_projectId: ProjectId): Observable<UnarchiveProjectResponse> {
    return ProjectFetch.unarchive(_projectId)
      .concatMap(r =>
        ProjectModel.update(<string>_projectId, r)
      )
  }

  /**
   * 从一个未 complete 的 get 流中 take(1)
   * 因为这个数据不可能再变更
   */
  getReportSummary (_projectId: ProjectId, query?: any): Observable<ReportSummarySchema> {
    return makeColdSignal<ReportSummarySchema>(() => {
      const index = `reportSummary:${_projectId}`
      let result = ProjectModel.getNonstandardSchema<ReportSummarySchema>(index)
      if (!result) {
        result = ProjectFetch.getReportSummary(_projectId)
          .concatMap(r =>
            ProjectModel.saveNonstandardSchema(index, r)
          )
      }
      return result.take(1)
    })
  }

  getAnalysisReport(_projectId: ProjectId, startDate: string, endDate: string, unit: GetAnalysisReportUnit): Observable<ReportAnalysisSchema> {
    return ProjectFetch.getAnalysisReport( _projectId, startDate, endDate, unit)
  }

}

export default new ProjectAPI
